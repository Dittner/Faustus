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
    @ObservedObject var bibliography: Bibliography

    private(set) var user: User!
    private var disposeBag: Set<AnyCancellable> = []

    init() {
        if !DocumentsStorage.existDir(.user) { DocumentsStorage.createDir(.user) }
        if !DocumentsStorage.existDir(.authors) { DocumentsStorage.createDir(.authors) }
        if !DocumentsStorage.existDir(.books) { DocumentsStorage.createDir(.books) }
        if !DocumentsStorage.existDir(.tags) { DocumentsStorage.createDir(.tags) }

        bibliography = Bibliography()
    }

    func loadUser() {
        let userFileUrls = DocumentsStorage.getContentOf(dir: .user, filesWithExtension: "faustus")
        if userFileUrls.count > 0, let userFromFile = User(from: userFileUrls[0]) {
            logInfo(tag: .IO, msg: "the user profile has been read")
            user = userFromFile

        } else {
            logInfo(tag: .IO, msg: "the user has not yet a profile")
            user = User(location: .user)
        }
        selectedConspectus = user
    }

    func loadUserFiles() {
        loadAuthors()
        loadBooks()
        loadTags()
        deserialize()
        bibliography.updateHashNames()

        prepareRecentOpenedStack()
        // Font.printAllSystemFonts()
    }

    private func loadAuthors() {
        let authorFileUrls = DocumentsStorage.getContentOf(dir: .authors, filesWithExtension: "faustus")
        logInfo(tag: .IO, msg: "Author files = \(authorFileUrls.count)")
        if authorFileUrls.count > 0 {
            for fileUrl in authorFileUrls {
                if Author(from: fileUrl) == nil {
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
                if Book(from: fileUrl) == nil {
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
                if Tag(from: fileUrl) == nil {
                    logErr(tag: .IO, msg: "Could't read a file with url: \(fileUrl.description)")
                }
            }
        }
    }

    private func deserialize() {
        logInfo(tag: .IO, msg: "Deserialization of all conspectus-files")
        for c in bibliography.getValues() {
            c.deserializeLinkedFiles()
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

    func selectUser() {
        selectedConspectus = user
    }

    func select(_ conspectus: Conspectus) {
        if selectedConspectus != conspectus && selectedConspectus.validate() == .ok {
            selectedConspectus.store()
            selectedConspectus = conspectus
        }
    }

    func closeSelectedConspectus() {
        guard recentOpened.count > 1 else { return }

        if selectedConspectus.validate() == .ok {
            selectedConspectus.store()
            recentOpened.append(selectedConspectus)
            recentOpened.removeFirst()
            selectedConspectus = recentOpened[0]
        }
    }

    func createConspectus(_ genus: ConspectusGenus) {
        if selectedConspectus.validate() == .ok {
            selectedConspectus.store()
            switch genus {
            case .user:
                selectedConspectus = User(location: .user)
            case .author:
                selectedConspectus = Author(location: .authors)
            case .book:
                selectedConspectus = Book(location: .books)
            case .tag:
                selectedConspectus = Tag(location: .tags)
            default:
                return
            }
        }
    }

    //
    // Remove
    //

    func removeSelectedConspectus() {
        if selectedConspectus.state.isNew {
            bibliography.remove(selectedConspectus)
            recentOpened.removeFirst()
            selectedConspectus = recentOpened[0]
        } else if selectedConspectus.state.isRemoved {
            logInfo(tag: .APP, msg: "Destroy conspectus, id: \(selectedConspectus.id)")
            for conspectus in bibliography.getValues() {
                conspectus.didDestroy(selectedConspectus)
                if conspectus.state.hasChanges {
                    _ = conspectus.store()
                }
            }
            bibliography.remove(selectedConspectus)
            recentOpened.removeFirst()
            selectedConspectus.destroy()
            selectedConspectus = recentOpened[0]
        } else {
            logInfo(tag: .APP, msg: "Remove conspectus, id: \(selectedConspectus.id)")
            selectedConspectus.remove()
            selectedConspectus.state.isEditing = false
        }
    }
}

protocol ViewModel: ObservableObject {
    var model: AppModel { get }
    var rootVM: RootViewModel { get }
}

extension ViewModel {
    var model: AppModel {
        return AppModel.shared
    }

    var rootVM: RootViewModel {
        return RootViewModel.shared!
    }
}
