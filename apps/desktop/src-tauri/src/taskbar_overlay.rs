//! Win32 taskbar overlay icon via ITaskbarList3::SetOverlayIcon

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
    use windows::core::Interface;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::Graphics::Gdi::{LoadImageW, IMAGE_ICON, LR_LOADFROMFILE};
    use windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, COINIT_APARTMENTTHREADED};
    use windows::Win32::UI::Shell::{CLSID_TaskbarList, ITaskbarList3, TaskbarList};
    use windows::core::w;
    use std::path::PathBuf;

    unsafe {
        CoInitializeEx(None, COINIT_APARTMENTTHREADED).map_err(|e| e.to_string())?;

        let taskbar: ITaskbarList3 = CoCreateInstance(&CLSID_TaskbarList, None, windows::Win32::System::Com::CLSCTX_INPROC_SERVER)
            .map_err(|e| e.to_string())?;

        let hwnd = window.hwnd().map_err(|e| e.to_string())?;

        match status {
            Some("ok") | Some("warning") | Some("error") => {
                let resource_path = window.app_handle().path().resource_dir().map_err(|e| e.to_string())?;
                let icon_name = match status {
                    Some("error") => "overlay_error.ico",
                    Some("warning") => "overlay_warning.ico",
                    _ => "overlay_ok.ico",
                };
                let icon_path: PathBuf = [resource_path.as_path(), icon_name].iter().collect();

                if icon_path.exists() {
                    let wide_path: Vec<u16> = icon_path.to_string_lossy().encode_utf16().chain(std::iter::once(0)).collect();
                    let hicon = LoadImageW(
                        None,
                        windows::core::PCWSTR::from_raw(wide_path.as_ptr()),
                        IMAGE_ICON,
                        16,
                        16,
                        LR_LOADFROMFILE,
                    );
                    if !hicon.is_invalid() {
                        let _ = taskbar.SetOverlayIcon(HWND(hwnd.0), Some(hicon.into()), w!(""));
                    }
                }
            }
            _ => {
                let _ = taskbar.SetOverlayIcon(HWND(hwnd.0), None, w!(""));
            }
        }

        Ok(())
    }
}
