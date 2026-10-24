import { useState } from 'react'
import { taiwanDay } from '../../shared/domain.mjs'
import { exportProgress, describeImport, restoreProgress } from '../lib/standalone'
import { saveTextFile, pickTextFile } from '../lib/deviceFiles'
import { BUILD } from '../lib/target'

/**
 * iPad 單機版的家長面板（長按 👪 打開）：單機版沒有 Studio，這裡只做紀錄的匯出與還原。
 * - 匯出：存到 pCloud 或「檔案」，給 Mac 的 Studio 匯入、也是備份（刪掉 App 紀錄就沒了）
 * - 還原：換簽名帳號後的新 App、換 iPad、誤刪重裝時，用匯出檔整份取代這台的紀錄
 */
export default function DeviceParent({ onClose }: { onClose: () => void }) {
  const [note, setNote] = useState('')
  const [pending, setPending] = useState<{ data: unknown; text: string } | null>(null)

  const doExport = async () => {
    const data = await exportProgress()
    saveTextFile(`字字樂園紀錄-${taiwanDay()}.json`, JSON.stringify(data))
    setNote(`已匯出 ${data.events.length} 筆紀錄`)
  }
  const pick = async () => {
    setNote('')
    const raw = await pickTextFile()
    if (raw === null) return
    let data: unknown
    try { data = JSON.parse(raw) } catch { return setNote('這個檔打不開，不是紀錄檔') }
    const info = await describeImport(data)
    if (info.error) return setNote(info.error)
    setPending({ data, text: `檔案是 ${taiwanDay(info.exportedAt)} 匯出的，有 ${info.fileEvents} 筆紀錄；這台現在有 ${info.hereEvents} 筆。` +
      (info.sameDevice ? '' : '（檔案來自另一台裝置或另一個 App）') + '還原後，這台的紀錄會整份換成檔案裡的。' })
  }
  const restore = async () => {
    if (!pending) return
    await restoreProgress(pending.data)
    location.reload()
  }

  return (
    <div className="mine" role="dialog" aria-modal="true" aria-label="家長">
      <div className="mine-back" onClick={onClose} />
      <div className="mine-sheet device-parent">
        <h2>👪 家長</h2>
        {pending ? (
          <>
            <p>{pending.text}</p>
            <button className="device-parent-btn warn" onClick={restore}>確定還原</button>
            <button className="device-parent-btn" onClick={() => setPending(null)}>先不要</button>
          </>
        ) : (
          <>
            <button className="device-parent-btn" onClick={doExport}>匯出紀錄</button>
            <button className="device-parent-btn" onClick={pick}>從檔案還原紀錄</button>
            {note && <p role="status">{note}</p>}
            <button className="device-parent-btn" onClick={onClose}>關閉</button>
          </>
        )}
        <small>版本 {BUILD.version}（{BUILD.build}）</small>
      </div>
    </div>
  )
}
