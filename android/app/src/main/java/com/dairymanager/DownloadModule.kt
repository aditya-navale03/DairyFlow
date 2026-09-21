package com.dairymanager

import android.content.ContentValues
import android.os.Build
import android.provider.MediaStore
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class DownloadModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DownloadModule"
    }

    @ReactMethod
    fun saveToDownloads(
        sourcePath: String,
        fileName: String
    ) {
        val resolver = reactApplicationContext.contentResolver

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {

            val values = ContentValues().apply {
                put(
                    MediaStore.Downloads.DISPLAY_NAME,
                    fileName
                )
                put(
                    MediaStore.Downloads.MIME_TYPE,
                    "application/pdf"
                )
                put(
                    MediaStore.Downloads.RELATIVE_PATH,
                    "Download"
                )
                put(
                    MediaStore.Downloads.IS_PENDING,
                    1
                )
            }

            val uri = resolver.insert(
                MediaStore.Downloads.EXTERNAL_CONTENT_URI,
                values
            ) ?: return

            resolver.openOutputStream(uri)?.use { output ->
                File(sourcePath).inputStream().use { input ->
                    input.copyTo(output)
                }
            }

            values.clear()
            values.put(
                MediaStore.Downloads.IS_PENDING,
                0
            )

            resolver.update(
                uri,
                values,
                null,
                null
            )
        }
    }
}