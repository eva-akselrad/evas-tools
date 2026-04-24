# JARVIS Shutdown Server - Task Scheduler Setup

## Automatic Startup with Windows Task Scheduler

Follow these steps to add the JARVIS server to start automatically when Windows boots:

### Method 1: Using Task Scheduler GUI

1. **Open Task Scheduler**
   - Press `Win + R`, type `taskschd.msc`, and press Enter
   - Or search for "Task Scheduler" in Windows search

2. **Create a New Task**
   - Click "Create Task..." on the right panel
   - **General Tab:**
     - Name: `JARVIS System Control`
     - Description: `JARVIS shutdown server - runs on port 1234`
     - ✓ Check "Run with highest privileges" (required for shutdown commands)
     - Select "Run whether user is logged in or not"

3. **Triggers Tab**
   - Click "New..."
   - Set "Begin the task" to "At startup"
   - Click OK

4. **Actions Tab**
   - Click "New..."
   - **Action:** Start a program
   - **Program/script:** `C:\Users\scien\OneDrive\Documents\GitHub\evastools\ShutdownApp\startup.bat`
   - Click OK

5. **Conditions Tab** (Optional)
   - Uncheck "Start the task only if the computer is on AC power"

6. **Settings Tab**
   - ✓ Check "Allow task to be run on demand"
   - Set "If the running task does not end when requested, force it to stop" to a reasonable timeout

7. **Click OK** to save

### Method 2: Using PowerShell (Admin)

```powershell
# Run as Administrator
$TaskName = "JARVIS System Control"
$ScriptPath = "C:\Users\scien\OneDrive\Documents\GitHub\evas_tools\ShutdownApp\startup.bat"
$Principal = New-ScheduledTaskPrincipal -UserID "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$Trigger = New-ScheduledTaskTrigger -AtStartup
$Action = New-ScheduledTaskAction -Execute "$ScriptPath"
Register-ScheduledTask -Principal $Principal -Trigger $Trigger -Action $Action -TaskName $TaskName -Description "JARVIS shutdown server on port 1234" -Force
```

### Method 3: Using Command Prompt (Admin)

```batch
schtasks /create /tn "JARVIS System Control" /tr "C:\Users\scien\OneDrive\Documents\GitHub\evas_tools\ShutdownApp\startup.bat" /sc onstart /ru SYSTEM /rl HIGHEST /f
```

## Verify Installation

1. **Check if task is registered:**
   ```powershell
   Get-ScheduledTask -TaskName "JARVIS System Control"
   ```

2. **Manually run the task:**
   - In Task Scheduler, find the task and click "Run"
   - Check http://localhost:1234 in your browser

3. **View logs:**
   - Task Scheduler will log runs in Event Viewer under:
     - `Windows Logs > System` or `Applications and Services > Task Scheduler`

## Troubleshooting

- **Permission Denied:** Make sure "Run with highest privileges" is enabled
- **Task won't start:** Check that the batch file path is correct and uses full paths
- **Port 1234 in use:** Change the PORT in `src/index.ts` and rebuild
- **Node not found:** Ensure Node.js is installed and accessible in PATH

## Starting Manually

Until you set up automatic startup, you can manually start the server:

1. Open Command Prompt or PowerShell
2. Navigate to the ShutdownApp folder
3. Run: `npm start` or `./startup.bat`

## Stopping the Server

- Press `Ctrl + C` in the terminal where it's running
- Or disable the task in Task Scheduler
- Or use: `taskkill /IM node.exe`
