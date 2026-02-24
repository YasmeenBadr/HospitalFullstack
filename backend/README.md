# Hospital Backend (Spring Boot)

Run the backend **without installing Maven** by using the Maven Wrapper.

## Run the server

From the `backend` folder:

```powershell
.\mvnw.cmd spring-boot:run
```

(Use `mvn spring-boot:run` only if you have Maven installed and on your PATH.)

## If you see "JAVA_HOME not found"

Set the `JAVA_HOME` environment variable to your JDK installation folder, then run the command again.

**One-time in PowerShell (current session):**

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
.\mvnw.cmd spring-boot:run
```

Replace `C:\Program Files\Java\jdk-17` with your actual JDK path (e.g. `jdk-21`). To find it: where Java is installed, or run `(Get-Command java).Path` and use the parent of the `bin` folder.

**Permanently (Windows):**

1. Open **Edit the system environment variables** (search in Start).
2. Click **Environment Variables**.
3. Under **System variables** (or **User variables**), click **New**.
4. Variable name: `JAVA_HOME`
5. Variable value: your JDK folder, e.g. `C:\Program Files\Java\jdk-17`
6. OK out, then open a **new** terminal and run `.\mvnw.cmd spring-boot:run` again.

The API runs at `http://localhost:8080`. The React frontend expects the backend on that port.
