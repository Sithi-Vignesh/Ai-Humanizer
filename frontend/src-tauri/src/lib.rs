#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let backend_path = std::path::Path::new(
                r"C:\Users\sithi\Coding\AI-Humanizer-Release\backend\ai-humanizer-backend.exe"
            );

            std::process::Command::new(backend_path)
                .current_dir(backend_path.parent().unwrap())
                .spawn()
                .expect("failed to spawn backend");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}