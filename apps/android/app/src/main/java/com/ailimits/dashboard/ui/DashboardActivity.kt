package com.ailimits.dashboard.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ailimits.dashboard.data.AggregatedState
import com.ailimits.dashboard.repository.ConfigRepository
import com.ailimits.dashboard.repository.aggregateUsage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class DashboardActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            var state by remember { mutableStateOf<AggregatedState?>(null) }
            var configs by remember { mutableStateOf<List<com.ailimits.dashboard.data.ProviderConfig>>(emptyList()) }

            LaunchedEffect(Unit) {
                configs = withContext(Dispatchers.IO) { ConfigRepository.getConfigs(this@DashboardActivity) }
                state = if (configs.isEmpty()) null else aggregateUsage(configs)
            }

            Scaffold(
                topBar = { TopAppBar(title = { Text("AI Limits Dashboard") }) }
            ) { padding ->
                Column(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp)) {
                    if (configs.isEmpty()) {
                        Text("Добавьте провайдеры в настройках")
                    } else {
                        state?.snapshots?.forEach { s ->
                            Text("${s.displayName ?: s.providerId}: ${s.used}/${s.limit} ${s.unit}")
                        }
                    }
                    Button(onClick = { startActivity(Intent(this@DashboardActivity, SettingsActivity::class.java)) }) {
                        Text("Настройки")
                    }
                }
            }
        }
    }
}
