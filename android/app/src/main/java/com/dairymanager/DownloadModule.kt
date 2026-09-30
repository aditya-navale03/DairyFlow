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
    fileName: String,
    promise: com.facebook.react.bridge.Promise
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
)

if (uri == null) {
    promise.reject(
        "DOWNLOAD_ERROR",
        "Could not create download file"
    )
    return
}

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

            promise.resolve(uri.toString())
        }
    }
@ReactMethod
fun shareToWhatsApp(
    fileUri: String,
    phoneNumber: String,
    promise: com.facebook.react.bridge.Promise
) {
    try {
        val sourceFile = File(fileUri)

        android.util.Log.d(
    "WHATSAPP_SHARE",
    "SOURCE FILE: $fileUri"
)

android.util.Log.d(
    "WHATSAPP_SHARE",
    "EXISTS: ${sourceFile.exists()}"
)


        val uri = androidx.core.content.FileProvider.getUriForFile(
            reactApplicationContext,
            "${reactApplicationContext.packageName}.fileprovider",
            sourceFile
        )

android.util.Log.d(
    "WHATSAPP_SHARE",
    "SHARE URI: $uri"
)

        val intent = android.content.Intent(
            android.content.Intent.ACTION_SEND
        )

        intent.type = "application/pdf"

        intent.putExtra(
            android.content.Intent.EXTRA_STREAM,
            uri
        )

        val cleanNumber =
    phoneNumber.replace("+", "").replace(" ", "")

intent.putExtra(
    "jid",
    "${cleanNumber}@s.whatsapp.net"
)

        intent.addFlags(
            android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
        )

        intent.setPackage("com.whatsapp")

        reactApplicationContext.startActivity(
            android.content.Intent.createChooser(
                intent,
                "Send PDF"
            ).apply {
                addFlags(
                    android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                )
            }
        )

        promise.resolve(true)

    } catch (e: Exception) {
        promise.reject(
            "WHATSAPP_SHARE_ERROR",
            e.message
        )
    }
}
}