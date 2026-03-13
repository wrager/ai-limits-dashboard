package com.ailimits.dashboard.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class SettingsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Scaffold(
                topBar = { TopAppBar(title = { Text("Настройки") }) }
            ) { padding ->
                Column(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp)) {
                    Text("Экран настроек: добавление провайдеров, API ключи")
                }
            }
        }
    }
}
