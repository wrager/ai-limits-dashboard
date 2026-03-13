package com.ailimits.dashboard.widget

import android.content.Context
import androidx.glance.GlanceModifier
import androidx.glance.action.Button
import androidx.glance.action.actionStartActivity
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.Text
import androidx.glance.unit.dp
import com.ailimits.dashboard.ui.DashboardActivity
import com.ailimits.dashboard.data.UsageSnapshot
import com.ailimits.dashboard.repository.ConfigRepository
import com.ailimits.dashboard.repository.aggregateUsage

class AILimitsWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: androidx.glance.appwidget.GlanceId) {
        val configs = ConfigRepository.getConfigs(context)
        provideContent {
            val state = if (configs.isEmpty()) null else aggregateUsage(configs)

            Column(
                modifier = GlanceModifier.fillMaxWidth().padding(12.dp),
                verticalAlignment = Alignment.Top,
                horizontalAlignment = Alignment.Start
            ) {
                Text(text = "AI Limits")
                Spacer(modifier = GlanceModifier.height(8.dp))
                if (configs.isEmpty()) {
                    Text(text = "Добавьте провайдеры в настройках")
                } else if (state?.snapshots?.isEmpty() == true) {
                    Text(text = "Нет данных")
                } else {
                    state?.snapshots?.forEach { snapshot ->
                        Text(
                            text = "${snapshot.displayName ?: snapshot.providerId}: ${snapshot.used.toInt()}/${snapshot.limit.toInt()} ${snapshot.unit}"
                        )
                        Spacer(modifier = GlanceModifier.height(4.dp))
                    }
                }
                Spacer(modifier = GlanceModifier.height(8.dp))
                Button(
                    text = "Dashboard",
                    onClick = actionStartActivity<DashboardActivity>()
                )
            }
        }
    }
}
