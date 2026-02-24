import { useEffect, useState, FormEvent } from 'react'
import './App.css'

const API_BASE = 'http://localhost:8080/api'

type Gender = 'M' | 'F' | 'O' | ''

interface Patient {
  id?: number
  fullName: string
  dateOfBirth?: string
  gender?: Gender
  phone?: string
  address?: string
}

interface Doctor {
  id?: number
  fullName: string
  specialty?: string
  phone?: string
  email?: string
}

interface Appointment {
  id?: number
  patient: Patient
  doctor: Doctor
  startTime: string
  reason?: string
}

interface Department {
  id?: number
  name: string
  description?: string
}

interface Prescription {
  id?: number
  patient: Patient
  doctor: Doctor
  medicationName: string
  dosage?: string
  instructions?: string
  prescribedDate: string
  status?: string
}

interface MedicalRecord {
  id?: number
  patient: Patient
  recordDate: string
  category: string
  title?: string
  content?: string
}

type Tab = 'patients' | 'doctors' | 'appointments' | 'prescriptions' | 'medical-records' | 'departments'

async function http<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json()
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('patients')

  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Patient form state
  const [patientForm, setPatientForm] = useState<Patient>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
  })

  // Doctor form state
  const [doctorForm, setDoctorForm] = useState<Doctor>({
    fullName: '',
    specialty: '',
    phone: '',
    email: '',
  })

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState<{
    patientId: string
    doctorId: string
    startTime: string
    reason: string
  }>({
    patientId: '',
    doctorId: '',
    startTime: '',
    reason: '',
  })

  const [prescriptionForm, setPrescriptionForm] = useState<{
    patientId: string
    doctorId: string
    medicationName: string
    dosage: string
    instructions: string
    prescribedDate: string
    status: string
  }>({
    patientId: '',
    doctorId: '',
    medicationName: '',
    dosage: '',
    instructions: '',
    prescribedDate: '',
    status: 'ACTIVE',
  })

  const [medicalRecordForm, setMedicalRecordForm] = useState<{
    patientId: string
    recordDate: string
    category: string
    title: string
    content: string
  }>({
    patientId: '',
    recordDate: new Date().toISOString().slice(0, 10),
    category: 'NOTE',
    title: '',
    content: '',
  })

  const [departmentForm, setDepartmentForm] = useState<Department>({
    name: '',
    description: '',
  })

  useEffect(() => {
    void refreshAll()
  }, [])

  async function refreshAll() {
    setLoading(true)
    setError(null)
    try {
      const [p, d, a, rx, mr, dept] = await Promise.all([
        http<Patient[]>(`${API_BASE}/patients`),
        http<Doctor[]>(`${API_BASE}/doctors`),
        http<Appointment[]>(`${API_BASE}/appointments`),
        http<Prescription[]>(`${API_BASE}/prescriptions`),
        http<MedicalRecord[]>(`${API_BASE}/medical-records`),
        http<Department[]>(`${API_BASE}/departments`),
      ])
      setPatients(p)
      setDoctors(d)
      setAppointments(a)
      setPrescriptions(rx)
      setMedicalRecords(mr)
      setDepartments(dept)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePatient(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const created = await http<Patient>(`${API_BASE}/patients`, {
        method: 'POST',
        body: JSON.stringify(patientForm),
      })
      setPatients((prev) => [...prev, created])
      setPatientForm({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        address: '',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create patient')
    }
  }

  async function handleDeletePatient(id: number) {
    setError(null)
    try {
      await fetch(`${API_BASE}/patients/${id}`, { method: 'DELETE' })
      setPatients((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete patient')
    }
  }

  async function handleCreateDoctor(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const created = await http<Doctor>(`${API_BASE}/doctors`, {
        method: 'POST',
        body: JSON.stringify(doctorForm),
      })
      setDoctors((prev) => [...prev, created])
      setDoctorForm({
        fullName: '',
        specialty: '',
        phone: '',
        email: '',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create doctor')
    }
  }

  async function handleDeleteDoctor(id: number) {
    setError(null)
    try {
      await fetch(`${API_BASE}/doctors/${id}`, { method: 'DELETE' })
      setDoctors((prev) => prev.filter((d) => d.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete doctor')
    }
  }

  async function handleCreateAppointment(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const patient = patients.find((p) => p.id === Number(appointmentForm.patientId))
    const doctor = doctors.find((d) => d.id === Number(appointmentForm.doctorId))
    if (!patient || !doctor) {
      setError('Please select a valid patient and doctor')
      return
    }
    const payload: Appointment = {
      patient,
      doctor,
      startTime: appointmentForm.startTime,
      reason: appointmentForm.reason,
    }
    try {
      const created = await http<Appointment>(`${API_BASE}/appointments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setAppointments((prev) => [...prev, created])
      setAppointmentForm({
        patientId: '',
        doctorId: '',
        startTime: '',
        reason: '',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create appointment')
    }
  }

  async function handleDeleteAppointment(id: number) {
    setError(null)
    try {
      await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' })
      setAppointments((prev) => prev.filter((a) => a.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete appointment')
    }
  }

  async function handleCreatePrescription(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const patient = patients.find((p) => p.id === Number(prescriptionForm.patientId))
    const doctor = doctors.find((d) => d.id === Number(prescriptionForm.doctorId))
    if (!patient || !doctor) {
      setError('Please select a valid patient and doctor')
      return
    }
    const payload: Prescription = {
      patient,
      doctor,
      medicationName: prescriptionForm.medicationName,
      dosage: prescriptionForm.dosage || undefined,
      instructions: prescriptionForm.instructions || undefined,
      prescribedDate: prescriptionForm.prescribedDate,
      status: prescriptionForm.status || 'ACTIVE',
    }
    try {
      const created = await http<Prescription>(`${API_BASE}/prescriptions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setPrescriptions((prev) => [...prev, created])
      setPrescriptionForm({
        patientId: '',
        doctorId: '',
        medicationName: '',
        dosage: '',
        instructions: '',
        prescribedDate: '',
        status: 'ACTIVE',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create prescription')
    }
  }

  async function handleDeletePrescription(id: number) {
    setError(null)
    try {
      await fetch(`${API_BASE}/prescriptions/${id}`, { method: 'DELETE' })
      setPrescriptions((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete prescription')
    }
  }

  async function handleCreateMedicalRecord(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const patient = patients.find((p) => p.id === Number(medicalRecordForm.patientId))
    if (!patient) {
      setError('Please select a patient')
      return
    }
    const payload: MedicalRecord = {
      patient,
      recordDate: medicalRecordForm.recordDate,
      category: medicalRecordForm.category,
      title: medicalRecordForm.title || undefined,
      content: medicalRecordForm.content || undefined,
    }
    try {
      const created = await http<MedicalRecord>(`${API_BASE}/medical-records`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setMedicalRecords((prev) => [...prev, created])
      setMedicalRecordForm({
        patientId: '',
        recordDate: new Date().toISOString().slice(0, 10),
        category: 'NOTE',
        title: '',
        content: '',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create medical record')
    }
  }

  async function handleDeleteMedicalRecord(id: number) {
    setError(null)
    try {
      await fetch(`${API_BASE}/medical-records/${id}`, { method: 'DELETE' })
      setMedicalRecords((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete medical record')
    }
  }

  async function handleCreateDepartment(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const created = await http<Department>(`${API_BASE}/departments`, {
        method: 'POST',
        body: JSON.stringify(departmentForm),
      })
      setDepartments((prev) => [...prev, created])
      setDepartmentForm({ name: '', description: '' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create department')
    }
  }

  async function handleDeleteDepartment(id: number) {
    setError(null)
    try {
      await fetch(`${API_BASE}/departments/${id}`, { method: 'DELETE' })
      setDepartments((prev) => prev.filter((d) => d.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete department')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hospital Management</h1>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'patients' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('patients')}
        >
          Patients
        </button>
        <button
          className={activeTab === 'doctors' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('doctors')}
        >
          Doctors
        </button>
        <button
          className={activeTab === 'appointments' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button
          className={activeTab === 'prescriptions' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('prescriptions')}
        >
          Prescriptions
        </button>
        <button
          className={activeTab === 'medical-records' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('medical-records')}
        >
          Medical records
        </button>
        <button
          className={activeTab === 'departments' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('departments')}
        >
          Departments
        </button>
        <button className="refresh" onClick={() => void refreshAll()}>
          Refresh data
        </button>
      </nav>

      {loading && <div className="info-banner">Loading...</div>}
      {error && <div className="error-banner">{error}</div>}

      <main className="content">
        {activeTab === 'patients' && (
          <section>
            <h2>Patients</h2>
            <div className="grid">
              <form className="card" onSubmit={handleCreatePatient}>
                <h3>Add patient</h3>
                <label>
                  Full name *
                  <input
                    required
                    value={patientForm.fullName}
                    onChange={(e) =>
                      setPatientForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Date of birth
                  <input
                    type="date"
                    value={patientForm.dateOfBirth ?? ''}
                    onChange={(e) =>
                      setPatientForm((f) => ({ ...f, dateOfBirth: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Gender
                  <select
                    value={patientForm.gender ?? ''}
                    onChange={(e) =>
                      setPatientForm((f) => ({
                        ...f,
                        gender: e.target.value as Gender,
                      }))
                    }
                  >
                    <option value="">Not set</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </label>
                <label>
                  Phone
                  <input
                    value={patientForm.phone ?? ''}
                    onChange={(e) =>
                      setPatientForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Address
                  <input
                    value={patientForm.address ?? ''}
                    onChange={(e) =>
                      setPatientForm((f) => ({ ...f, address: e.target.value }))
                    }
                  />
                </label>
                <button type="submit">Save patient</button>
              </form>

              <div className="card">
                <h3>Existing patients</h3>
                {patients.length === 0 ? (
                  <p>No patients yet.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>DOB</th>
                        <th>Gender</th>
                        <th>Phone</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((p) => (
                        <tr key={p.id}>
                          <td>{p.fullName}</td>
                          <td>{p.dateOfBirth}</td>
                          <td>{p.gender}</td>
                          <td>{p.phone}</td>
                          <td>
                            <button
                              className="danger"
                              type="button"
                              onClick={() => p.id && void handleDeletePatient(p.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'doctors' && (
          <section>
            <h2>Doctors</h2>
            <div className="grid">
              <form className="card" onSubmit={handleCreateDoctor}>
                <h3>Add doctor</h3>
                <label>
                  Full name *
                  <input
                    required
                    value={doctorForm.fullName}
                    onChange={(e) =>
                      setDoctorForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Specialty
                  <input
                    value={doctorForm.specialty ?? ''}
                    onChange={(e) =>
                      setDoctorForm((f) => ({ ...f, specialty: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={doctorForm.phone ?? ''}
                    onChange={(e) =>
                      setDoctorForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={doctorForm.email ?? ''}
                    onChange={(e) =>
                      setDoctorForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </label>
                <button type="submit">Save doctor</button>
              </form>

              <div className="card">
                <h3>Existing doctors</h3>
                {doctors.length === 0 ? (
                  <p>No doctors yet.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Specialty</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((d) => (
                        <tr key={d.id}>
                          <td>{d.fullName}</td>
                          <td>{d.specialty}</td>
                          <td>{d.phone}</td>
                          <td>{d.email}</td>
                          <td>
                            <button
                              className="danger"
                              type="button"
                              onClick={() => d.id && void handleDeleteDoctor(d.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'appointments' && (
          <section>
            <h2>Appointments</h2>
            <div className="grid">
              <form className="card" onSubmit={handleCreateAppointment}>
                <h3>Schedule appointment</h3>
                <label>
                  Patient *
                  <select
                    required
                    value={appointmentForm.patientId}
                    onChange={(e) =>
                      setAppointmentForm((f) => ({ ...f, patientId: e.target.value }))
                    }
                  >
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Doctor *
                  <select
                    required
                    value={appointmentForm.doctorId}
                    onChange={(e) =>
                      setAppointmentForm((f) => ({ ...f, doctorId: e.target.value }))
                    }
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} {d.specialty && `(${d.specialty})`}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Start time *
                  <input
                    type="datetime-local"
                    required
                    value={appointmentForm.startTime}
                    onChange={(e) =>
                      setAppointmentForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Reason
                  <input
                    value={appointmentForm.reason}
                    onChange={(e) =>
                      setAppointmentForm((f) => ({ ...f, reason: e.target.value }))
                    }
                  />
                </label>
                <button type="submit">Schedule</button>
              </form>

              <div className="card">
                <h3>Upcoming appointments</h3>
                {appointments.length === 0 ? (
                  <p>No appointments yet.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr key={a.id}>
                          <td>{a.patient?.fullName}</td>
                          <td>{a.doctor?.fullName}</td>
                          <td>{a.startTime}</td>
                          <td>{a.reason}</td>
                          <td>
                            <button
                              className="danger"
                              type="button"
                              onClick={() =>
                                a.id && void handleDeleteAppointment(a.id)
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'prescriptions' && (
          <section>
            <h2>Prescriptions</h2>
            <div className="grid">
              <form className="card" onSubmit={handleCreatePrescription}>
                <h3>New prescription</h3>
                <label>
                  Patient *
                  <select
                    required
                    value={prescriptionForm.patientId}
                    onChange={(e) =>
                      setPrescriptionForm((f) => ({ ...f, patientId: e.target.value }))
                    }
                  >
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Prescribing doctor *
                  <select
                    required
                    value={prescriptionForm.doctorId}
                    onChange={(e) =>
                      setPrescriptionForm((f) => ({ ...f, doctorId: e.target.value }))
                    }
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} {d.specialty && `(${d.specialty})`}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Medication *
                  <input
                    required
                    value={prescriptionForm.medicationName}
                    onChange={(e) =>
                      setPrescriptionForm((f) => ({ ...f, medicationName: e.target.value }))
                    }
                    placeholder="e.g. Amoxicillin 500mg"
                  />
                </label>
                <label>
                  Dosage
                  <input
                    value={prescriptionForm.dosage}
                    onChange={(e) =>
                      setPrescriptionForm((f) => ({ ...f, dosage: e.target.value }))
                    }
                    placeholder="e.g. 1 tablet twice daily"
                  />
                </label>
                <label>
                  Instructions
                  <input
                    value={prescriptionForm.instructions}
                    onChange={(e) =>
                      setPrescriptionForm((f) => ({ ...f, instructions: e.target.value }))
                    }
                    placeholder="Special instructions"
                  />
                </label>
                <label>
                  Prescribed date *
                  <input
                    type="date"
                    required
                    value={prescriptionForm.prescribedDate}
                    onChange={(e) =>
                      setPrescriptionForm((f) => ({ ...f, prescribedDate: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Status
                  <select
                    value={prescriptionForm.status}
                    onChange={(e) =>
                      setPrescriptionForm((f) => ({ ...f, status: e.target.value }))
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </label>
                <button type="submit">Save prescription</button>
              </form>
              <div className="card">
                <h3>All prescriptions</h3>
                {prescriptions.length === 0 ? (
                  <p>No prescriptions yet.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Medication</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((rx) => (
                        <tr key={rx.id}>
                          <td>{rx.patient?.fullName}</td>
                          <td>{rx.doctor?.fullName}</td>
                          <td>{rx.medicationName}</td>
                          <td>{rx.prescribedDate}</td>
                          <td>{rx.status}</td>
                          <td>
                            <button
                              className="danger"
                              type="button"
                              onClick={() =>
                                rx.id && void handleDeletePrescription(rx.id)
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'medical-records' && (
          <section>
            <h2>Medical records</h2>
            <div className="grid">
              <form className="card" onSubmit={handleCreateMedicalRecord}>
                <h3>Add medical record</h3>
                <label>
                  Patient *
                  <select
                    required
                    value={medicalRecordForm.patientId}
                    onChange={(e) =>
                      setMedicalRecordForm((f) => ({ ...f, patientId: e.target.value }))
                    }
                  >
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    value={medicalRecordForm.recordDate}
                    onChange={(e) =>
                      setMedicalRecordForm((f) => ({ ...f, recordDate: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Category
                  <select
                    value={medicalRecordForm.category}
                    onChange={(e) =>
                      setMedicalRecordForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    <option value="ALLERGY">Allergy</option>
                    <option value="CONDITION">Condition</option>
                    <option value="NOTE">Note</option>
                  </select>
                </label>
                <label>
                  Title
                  <input
                    value={medicalRecordForm.title}
                    onChange={(e) =>
                      setMedicalRecordForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="e.g. Penicillin allergy"
                  />
                </label>
                <label>
                  Content
                  <input
                    value={medicalRecordForm.content}
                    onChange={(e) =>
                      setMedicalRecordForm((f) => ({ ...f, content: e.target.value }))
                    }
                    placeholder="Details"
                  />
                </label>
                <button type="submit">Save record</button>
              </form>
              <div className="card">
                <h3>Medical records</h3>
                {medicalRecords.length === 0 ? (
                  <p>No medical records yet.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Title</th>
                        <th>Content</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {medicalRecords.map((mr) => (
                        <tr key={mr.id}>
                          <td>{mr.patient?.fullName}</td>
                          <td>{mr.recordDate}</td>
                          <td>{mr.category}</td>
                          <td>{mr.title}</td>
                          <td>{mr.content?.slice(0, 30)}{mr.content && mr.content.length > 30 ? '…' : ''}</td>
                          <td>
                            <button
                              className="danger"
                              type="button"
                              onClick={() =>
                                mr.id && void handleDeleteMedicalRecord(mr.id)
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'departments' && (
          <section>
            <h2>Departments</h2>
            <div className="grid">
              <form className="card" onSubmit={handleCreateDepartment}>
                <h3>Add department</h3>
                <label>
                  Name *
                  <input
                    required
                    value={departmentForm.name}
                    onChange={(e) =>
                      setDepartmentForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Cardiology"
                  />
                </label>
                <label>
                  Description
                  <input
                    value={departmentForm.description ?? ''}
                    onChange={(e) =>
                      setDepartmentForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Brief description"
                  />
                </label>
                <button type="submit">Save department</button>
              </form>
              <div className="card">
                <h3>Departments</h3>
                {departments.length === 0 ? (
                  <p>No departments yet.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((d) => (
                        <tr key={d.id}>
                          <td>{d.name}</td>
                          <td>{d.description}</td>
                          <td>
                            <button
                              className="danger"
                              type="button"
                              onClick={() => d.id && void handleDeleteDepartment(d.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
