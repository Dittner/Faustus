//
//  DocumentsStorage.swift
//  Faustus
//
//  Created by Alexander Dittner on 13.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation
enum StorageDirectory: String {
    case project = "Faustus"
    case logs
    case user
    case authors
    case books
    case tags
}

class DocumentsStorage {
    static var documentsURL: URL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    static var projectURL: URL = documentsURL.appendingPathComponent(StorageDirectory.project.rawValue)
    static var cryptor: Cryptor!

    open class func getUrl(of dir: StorageDirectory) -> URL {
        return projectURL.appendingPathComponent(dir.rawValue)
    }

    open class func existDir(_ dir: StorageDirectory) -> Bool {
        let dirPath = dir.rawValue
        var isDir: ObjCBool = true
        return FileManager.default.fileExists(atPath: projectURL.appendingPathComponent(dirPath).path, isDirectory: &isDir)
    }

    open class func createDir(_ dir: StorageDirectory) {
        let dirPath = dir.rawValue
        do {
            try FileManager.default.createDirectory(atPath: projectURL.appendingPathComponent(dirPath).path, withIntermediateDirectories: true, attributes: nil)
        } catch {
            logErr(tag: .IO, msg: "Unable to create directory with name: \(dirPath), error: \(error.localizedDescription)")
        }
    }

    open class func readFile(from url: URL, useEncryption: Bool) -> [String: Any]? {
        do {
            var data = try Data(contentsOf: url)
            if useEncryption {
                do {
                    data = try cryptor!.decrypt(data)
                } catch {
                    logErr(tag: .IO, msg: "DocumentsStorage.encrypt data failed: \(error.localizedDescription)")
                    return nil
                }
            }

            do {
                if let dict = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    if dict["id"] as? UID != nil {
                        return dict

                    } else {
                        logErr(tag: .PARSING, msg: "Failed to read id from file: \(url)")
                        return nil
                    }

                } else {
                    logErr(tag: .PARSING, msg: "Failed to transform json data to [String: Any] for a file: \(url)")
                    return nil
                }

            } catch let error as NSError {
                logErr(tag: .PARSING, msg: "Failed to parse json data to [String: Any] for a file \(url): \(error.localizedDescription)")
                return nil
            }

        } catch {
            logErr(tag: .IO, msg: "DocumentsStorage.readFile failed: \(error.localizedDescription)")
            return nil
        }
    }

    open class func writeFile(to fileUrl: URL, dict: [String: Any], useEncryption: Bool) -> Bool {
        do {
            let data = try JSONSerialization.data(withJSONObject: dict, options: .fragmentsAllowed)
            if useEncryption {
                let encrypted = try cryptor!.encrypt(data)
                try encrypted.write(to: fileUrl)
            } else {
                try data.write(to: fileUrl)
            }

            logInfo(tag: .IO, msg: "file with url = \(fileUrl) has been stored!")
            return true
        } catch {
            logErr(tag: .IO, msg: "Unable to write file with url: \(fileUrl), error: \(error.localizedDescription)")
            return false
        }
    }

    open class func getURLs(dir: StorageDirectory, filesWithExtension: String) -> [URL] {
        let dirPath = dir.rawValue
        do {
            return try FileManager.default.contentsOfDirectory(at: projectURL.appendingPathComponent(dirPath), includingPropertiesForKeys: nil).filter { $0.pathExtension == filesWithExtension }
        } catch {
            logErr(tag: .IO, msg: "DocumentsStorage.getContentOf dir: \(dir.rawValue) failed by invoke FileManager.default.contentsOfDirectory. Error: \(error.localizedDescription)")
            return []
        }
    }

    open class func deleteFile(from url: URL) {
        do {
            try FileManager.default.trashItem(at: url, resultingItemURL: nil)
            logInfo(tag: .IO, msg: "DocumentsStorage.deleteFile from url: \(url.description) has success")
        } catch {
            logErr(tag: .IO, msg: "DocumentsStorage.deleteFile failed: \(error.localizedDescription), with url: \(url.description)")
        }
    }
}
