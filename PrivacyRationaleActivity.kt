package com.fitplan.pro
import android.app.Activity
import android.os.Bundle
import android.widget.TextView
class PrivacyRationaleActivity: Activity(){ override fun onCreate(b: Bundle?){ super.onCreate(b); setContentView(TextView(this).apply{ text="FitPlan Pro, adım ve sağlık verilerini günlük hedeflerini göstermek ve sağlık senkronunu sağlamak için kullanır. Veriler iznin olmadan paylaşılmaz."; textSize=18f; setPadding(48,48,48,48) }) } }
