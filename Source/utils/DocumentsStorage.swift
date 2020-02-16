//
//  DocumentsStorage.swift
//  Faustus
//
//  Created by Alexander Dittner on 13.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation
class DocumentsStorage {
    static var documentsURL: URL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    static var projectURL:URL = documentsURL.appendingPathComponent(User.projectFolderName)

    open class func createDir(name: String) {
        let fileUrl = documentsURL.appendingPathComponent(name)
        do {
            try FileManager.default.createDirectory(atPath: fileUrl.path, withIntermediateDirectories: true, attributes: nil)
        } catch {
            print("Unable to create directory with name: \(name), error: \(error.localizedDescription)")
        }
    }

    open class func createFile(name: String, inFolder: String) -> URL? {
        DocumentsStorage.createDir(name: inFolder)

        var fileUrl: URL?
        if let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            fileUrl = dir.appendingPathComponent(inFolder, isDirectory: true)
            fileUrl = fileUrl!.appendingPathComponent(name)
        }

        return fileUrl
    }

    open class func getPlistFile(name: String) -> NSDictionary? {
        let fileUrl = projectURL.appendingPathComponent(name)
        return NSDictionary(contentsOfFile: fileUrl.path)
    }
}
