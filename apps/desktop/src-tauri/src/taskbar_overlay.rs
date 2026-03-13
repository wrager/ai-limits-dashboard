//! Win32 taskbar overlay icon — TODO: implement via ITaskbarList3::SetOverlayIcon
//! Currently a no-op; windows-rs 0.58 SetOverlayIcon API needs investigation.

#[tauri::command]
pub fn set_taskbar_overlay(
    window: tauri::WebviewWindow,
    status: Option<String>,
) -> Result<(), String> {
    let _ = window;
    let _ = status;
    Ok(())
}
