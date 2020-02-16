//
//  Logger.swift
//  Faustus
//
//  Created by Alexander Dittner on 13.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation
import SwiftUI

enum LogTag: String {
    case APP
    case UI
    case MEMORY
    case PARSING
    case IO
}

func logInfo(tag: LogTag, msg: String) {
    Logger.shared?.info(tag: tag, msg: msg)
}

func logWarn(tag: LogTag, msg: String) {
    Logger.shared?.warn(tag: tag, msg: msg)
}

func logErr(tag: LogTag, msg: String) {
    Logger.shared?.err(tag: tag, msg: msg)
}

class Logger {
    private(set) static var shared: Logger?

    private let keepLogsInDays: Int = 3
    private let logsDirName: String
    private let logsFileName: String
    private var log: String = ""
    private var logFileURL: URL?

    private let timeFormatter: DateFormatter = {
        var formatter = DateFormatter()
        formatter.dateFormat = "HH:mm:ss.SSS"
        return formatter
    }()

    static func run() {
        if shared == nil {
            shared = Logger()
        }
    }

    init() {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH-mm-ss"

        logsDirName = User.projectFolderName + "/" + User.logsFolderName
        logsFileName = formatter.string(from: Date()) + ".clientLog"

        logFileURL = DocumentsStorage.createFile(name: logsFileName, inFolder: logsDirName)

        var aboutLog: String = "Faustus Logs\n"
        let ver: String = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "0"
        let build: String = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "0"
        aboutLog += "v." + ver + "." + build + "\n"

        #if DEBUG
        aboutLog += "debug mode\n"
        aboutLog += "docs folder: \\" + FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].description
        #else
        aboutLog += "release mode\n"
        #endif
        
        let home = FileManager.default.homeDirectoryForCurrentUser
        print("hom = \(home.description)")

        info(tag: .APP, msg: aboutLog)
        removeExpiredLogs()
    }



    func createLogsFile(name: String) {
        if let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            logFileURL = dir.appendingPathComponent(logsDirName, isDirectory: true)
            logFileURL = logFileURL!.appendingPathComponent(logsFileName)
        }
    }

    func info(tag: LogTag, msg: String) {
        let txt = "i# " + timeFormatter.string(from: Date()) + " [" + tag.rawValue + "] " + msg
        print(txt)
        write2file(txt)
    }

    func warn(tag: LogTag, msg: String) {
        let txt = "w# " + timeFormatter.string(from: Date()) + " [" + tag.rawValue + "] " + msg
        print(txt)
        write2file(txt)
    }

    func err(tag: LogTag, msg: String) {
        let txt = "e# " + timeFormatter.string(from: Date()) + " [" + tag.rawValue + "] " + msg
        print(txt)
        write2file(txt)
    }

    func write2file(_ txt: String) {
        log += txt + "\n"
        if let url = logFileURL {
            do {
                try log.write(to: url, atomically: false, encoding: .utf8)
            } catch {
                print("Failed write logs to disk")
            }
        }
    }

    private func removeExpiredLogs() {
        guard let docsDir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else { return }
        let logsDirURL = docsDir.appendingPathComponent(logsDirName, isDirectory: true)
        do {
            let urls = try FileManager.default.contentsOfDirectory(at: logsDirURL, includingPropertiesForKeys: nil)
            let curDateTime = Int(Date().timeIntervalSinceReferenceDate)
            let expireTimeInSecs = curDateTime - keepLogsInDays * 24 * 60 * 60
            var countOfExpiredFiles: Int = 0

            for url: URL in urls {
                do {
                    let attributes: URLResourceValues = try url.resourceValues(forKeys: [.creationDateKey])

                    if let creationDate = attributes.creationDate {
                        if Int(creationDate.timeIntervalSinceReferenceDate) < expireTimeInSecs {
                            do {
                                try FileManager.default.removeItem(at: url)
                                countOfExpiredFiles += 1
                            } catch {
                                err(tag: .IO, msg: "Logger.removeExpiredLogs failed: \(error.localizedDescription), with url: \(url.description)")
                            }
                        }
                    }
                } catch {
                    err(tag: .IO, msg: "Logger.removeExpiredLogs failed: \(error.localizedDescription)")
                }
            }

            if countOfExpiredFiles > 1 {
                info(tag: .IO, msg: "\(countOfExpiredFiles) logfiles were removed")
            } else if countOfExpiredFiles > 0 {
                info(tag: .IO, msg: "\(countOfExpiredFiles) logfile was removed")
            }
        } catch {
            err(tag: .IO, msg: "Logger.removeExpiredLogs failed by invoke FileManager.default.contentsOfDirectory. Error: \(error.localizedDescription)")
        }
    }
}
