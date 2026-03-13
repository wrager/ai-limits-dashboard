//! Win32 taskbar overlay icon via ITaskbarList3::SetOverlayIcon

use tauri::Manager;

#[tauri::command]
pub fn set_taskbar_overlay(
    window: tauri::WebviewWindow,
    status: Option<String>,
) -> Result<(), String> {
    #[cfg(windows)]
    {
        set_taskbar_overlay_impl(&window, status.as_deref())
    }

    #[cfg(not(windows))]
    {
        let _ = window;
        let _ = status;
        Ok(())
    }
}

#[cfg(windows)]
fn set_taskbar_overlay_impl(window: &tauri::WebviewWindow, status: Option<&str>) -> Result<(), String> {
    use windows::core::GUID;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, COINIT_APARTMENTTHREADED};
    use windows::Win32::UI::Shell::ITaskbarList3;
    use windows::core::w;

    // CLSID_TaskbarList {56FDF344-FD6D-11d0-958A-006097C9A090}
    const CLSID_TASKBARLIST: GUID = GUID::from_values(
        0x56FDF344,
        0xFD6D,
        0x11D0,
        [0x95, 0x8A, 0x00, 0x60, 0x97, 0xC9, 0xA0, 0x90],
    );

    unsafe {
        let coinit = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
        if coinit.is_err() {
            return Err(format!("{:?}", coinit));
        }

        let taskbar: ITaskbarList3 = CoCreateInstance(
            &CLSID_TASKBARLIST,
            None,
            windows::Win32::System::Com::CLSCTX_INPROC_SERVER,
        )
        .map_err(|e| e.to_string())?;

        taskbar.HrInit().map_err(|e| e.to_string())?;

        let hwnd = window.hwnd().map_err(|e| e.to_string())?;

        // TODO: load overlay icons (overlay_ok.ico, overlay_warning.ico, overlay_error.ico)
        // when windows-rs Param/SetOverlayIcon API is clarified
        let _ = status;
        let _ = taskbar.SetOverlayIcon(HWND(hwnd.0), None, w!(""));

        Ok(())
    }
}
