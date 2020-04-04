//
//  AppModel.swift
//  Faustus
//
//  Created by Alexander Dittner on 27.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
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
    @Published private(set) var selectedConspectus: Conspectus!
    @Published private(set) var recentOpened: [Conspectus] = []
    @ObservedObject var authors: Bibliography
    @ObservedObject var books: Bibliography
    @ObservedObject var tags: Bibliography

    private(set) var userConspectus: Conspectus!
    private var disposeBag: Set<AnyCancellable> = []

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
        loadBooks()
        loadTags()

        prepareRecentOpenedStack()
        selectUser()
        //Font.printAllSystemFonts()
    }

    private func loadUser() {
        let userFileUrls = DocumentsStorage.getContentOf(dir: .user, filesWithExtension: "faustus")
        if userFileUrls.count > 0 {
            logInfo(tag: .IO, msg: "the user profile has been read")
            userConspectus = Conspectus(genus: .asUser, from: userFileUrls[0])!
        } else {
            logInfo(tag: .IO, msg: "the user has not yet a profile")
            userConspectus = Conspectus(genus: .asUser)
        }
    }

    
    private func loadAuthors() {
        let authorFileUrls = DocumentsStorage.getContentOf(dir: .authors, filesWithExtension: "faustus")
        logInfo(tag: .IO, msg: "Author files = \(authorFileUrls.count)")
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

    
    private func loadBooks() {
        let bookFileUrls = DocumentsStorage.getContentOf(dir: .books, filesWithExtension: "faustus")
        logInfo(tag: .IO, msg: "Books files = \(bookFileUrls.count)")
        if bookFileUrls.count > 0 {
            for fileUrl in bookFileUrls {
                if let c = Conspectus(genus: .asBook, from: fileUrl) {
                    books.add(c)
                } else {
                    logErr(tag: .IO, msg: "Could't read a file with url: \(fileUrl.description)")
                }
            }
        }
    }
    
    private func loadTags() {
        let tagFileUrls = DocumentsStorage.getContentOf(dir: .tags, filesWithExtension: "faustus")
        logInfo(tag: .IO, msg: "Tags files = \(tagFileUrls.count)")
        if tagFileUrls.count > 0 {
            for fileUrl in tagFileUrls {
                if let c = Conspectus(genus: .asTag, from: fileUrl) {
                    tags.add(c)
                } else {
                    logErr(tag: .IO, msg: "Could't read a file with url: \(fileUrl.description)")
                }
            }
        }
    }

    func prepareRecentOpenedStack() {
        $selectedConspectus
            .removeDuplicates()
            .compactMap { $0 }
            .sink { value in
                var mas = self.recentOpened
                mas.insert(value, at: 0)
                self.recentOpened = mas.removingDuplicates()

            }.store(in: &disposeBag)
    }

    // Selection

    func selectUser() {
        selectedConspectus = userConspectus
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

    func closeSelectedConspectus() {
        guard recentOpened.count > 1 else { return }

        if selectedConspectus!.store() != .failed {
            recentOpened.append(selectedConspectus)
            recentOpened.removeFirst()
            selectedConspectus = recentOpened[0]
        }
    }

    // Creation

    func createAuthor() {
        if selectedConspectus == nil || selectedConspectus!.store() != .failed {
            let newAuthor = Conspectus(genus: .asAuthor)
            selectedConspectus = newAuthor
            authors.add(newAuthor)
        }
    }

    func createBook() {
        if selectedConspectus == nil || selectedConspectus!.store() != .failed {
            let newBook = Conspectus(genus: .asBook)
            selectedConspectus = newBook
            books.add(newBook)
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
