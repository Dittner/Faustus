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

class AppModel: ObservableObject {
    static var shared = AppModel()

    @Published private(set) var areUserFilesReady: Bool = false
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
        let userFileUrls = DocumentsStorage.getURLs(dir: .user, filesWithExtension: "faustus")
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
        // Font.printAllSystemFonts()
        loadAuthors()
    }

    private func loadAuthors() {
        let authorFileUrls = DocumentsStorage.getURLs(dir: .authors, filesWithExtension: "faustus")
        logInfo(tag: .IO, msg: "Author files = \(authorFileUrls.count)")

        let iterator = AsyncIterator<URL>(authorFileUrls)
        iterator.iterate()
            .sink(receiveCompletion: { _ in
                self.loadBooks()
            }, receiveValue: { url in
                if Author(from: url) == nil {
                    logErr(tag: .IO, msg: "Could't read a file with url: \(url.description)")
                }
            }).store(in: &disposeBag)
    }

    private func loadBooks() {
        let bookFileUrls = DocumentsStorage.getURLs(dir: .books, filesWithExtension: "faustus")
        logInfo(tag: .IO, msg: "Books files = \(bookFileUrls.count)")
        
        let iterator = AsyncIterator<URL>(bookFileUrls)
        iterator.iterate()
            .sink(receiveCompletion: { _ in
                self.loadTags()
            }, receiveValue: { url in
                if Book(from: url) == nil {
                    logErr(tag: .IO, msg: "Could't read a file with url: \(url.description)")
                }
            }).store(in: &disposeBag)
    }

    private func loadTags() {
        let tagFileUrls = DocumentsStorage.getURLs(dir: .tags, filesWithExtension: "faustus")
        logInfo(tag: .IO, msg: "Tags files = \(tagFileUrls.count)")
        
        let iterator = AsyncIterator<URL>(tagFileUrls)
        iterator.iterate()
            .sink(receiveCompletion: { _ in
                self.deserializeLinkedFiles()
            }, receiveValue: { url in
                if Tag(from: url) == nil {
                    logErr(tag: .IO, msg: "Could't read a file with url: \(url.description)")
                }
            }).store(in: &disposeBag)
    }
    
    private func deserializeLinkedFiles() {
        logInfo(tag: .IO, msg: "Deserialization of all link conspectus-files")

        let iterator = AsyncIterator<Conspectus>(bibliography.getValues())
        iterator.iterate()
            .sink(receiveCompletion: { _ in
                self.completeFilesLoadingAndDeserialization()
            }, receiveValue: { c in
                c.deserializeLinkedFiles()
            }).store(in: &disposeBag)
    }
    
    private func completeFilesLoadingAndDeserialization() {
        bibliography.updateHashNames()
        prepareRecentOpenedStack()
        areUserFilesReady = true
    }

    private func prepareRecentOpenedStack() {
        $selectedConspectus
            .removeDuplicates()
            .compactMap { $0 }
            .sink { value in
                var mas = self.recentOpened
                mas.insert(value, at: 0)
                self.recentOpened = mas.removingDuplicates()

            }.store(in: &disposeBag)
    }
    
    //
    // Select
    //

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
        } else if selectedConspectus.state.isNew {
            removeSelectedConspectus()
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

class AsyncIterator<Element> {
    private var notifier: PassthroughSubject<Element, Never>
    private let elements: [Element]
    private var index: Int = 0

    init(_ elements: [Element]) {
        self.elements = elements
        notifier = PassthroughSubject<Element, Never>()
    }

    func iterate() -> PassthroughSubject<Element, Never> {
        DispatchQueue.main.async {
            self.iterateNext()
        }
        return notifier
    }

    private func iterateNext() {
        if index < elements.count {
            notifier.send(elements[index])
            index += 1
            DispatchQueue.main.async {
                self.iterateNext()
            }
        } else {
            notifier.send(completion: .finished)
        }
    }
}
