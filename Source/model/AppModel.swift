//
//  AppModel.swift
//  Faustus
//
//  Created by Alexander Dittner on 27.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation
import SwiftUI

enum AppModelState {
    case auth
    case loading
    case docView
    case docEditing
}

class AppModel: ObservableObject {
    static var shared = AppModel()

    @Published var state: AppModelState = .auth
    @Published private(set) var selectedConspectus: Conspectus?
    @ObservedObject var authors: Bibliography
    @ObservedObject var books: Bibliography
    @ObservedObject var tags: Bibliography
    private(set) var userConspectus: Conspectus!

    init() {
        if !DocumentsStorage.existDir(.user) { DocumentsStorage.createDir(.user) }
        if !DocumentsStorage.existDir(.authors) { DocumentsStorage.createDir(.authors) }
        if !DocumentsStorage.existDir(.books) { DocumentsStorage.createDir(.books) }
        if !DocumentsStorage.existDir(.tags) { DocumentsStorage.createDir(.tags) }

        authors = Bibliography()
        books = Bibliography()
        tags = Bibliography()

        loadUser()
        loadAuthors()
        
        //Font.printAllFonts()
    }

    private func loadUser() {
        let userFileUrls = DocumentsStorage.getContentOf(dir: .user, filesWithExtension: "faustus")
        if userFileUrls.count > 0 {
            logInfo(tag: .User, msg: "the user profile has been read")
            userConspectus = Conspectus(genus: .asUser, from: userFileUrls[0])!
        } else {
            logInfo(tag: .User, msg: "the user has not yet a profile")
            userConspectus = Conspectus(genus: .asUser)
        }
    }

    private func loadAuthors() {
        let authorFileUrls = DocumentsStorage.getContentOf(dir: .authors, filesWithExtension: "faustus")
        logInfo(tag: .User, msg: "Author files = \(authorFileUrls.count)")
        if authorFileUrls.count > 0 {
            for fileUrl in authorFileUrls {
                if let c = Conspectus(genus: .asAuthor, from: fileUrl) {
                    authors.add(c)
                } else {
                    logErr(tag: .IO, msg: "Could't read a file with url: \(fileUrl.description)")
                }
            }
        }
    }
    
    func select(_ conspectus: Conspectus) {
        if let curConspectus = selectedConspectus {
            if curConspectus != conspectus && selectedConspectus!.store() != .failed {
                selectedConspectus = conspectus
            }
        } else {
            selectedConspectus = conspectus
        }
    }

    func createAuthor() {
        if selectedConspectus == nil || selectedConspectus!.store() != .failed {
            let newAuthor = Conspectus(genus: .asAuthor)
            selectedConspectus = newAuthor
            authors.add(newAuthor)
        }
    }
}

protocol ViewModel: ObservableObject {
    var model: AppModel { get }
}

extension ViewModel {
    var model: AppModel {
        return AppModel.shared
    }
}
