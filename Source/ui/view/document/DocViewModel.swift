//
//  LoginViewModel.swift
//  Faustus
//
//  Created by Alexander Dittner on 17.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

final class DocViewModel: ViewModel {
    @Published var selectedConspectus: Conspectus
    @Published var selectedSection: DocViewSection = .books
    @Published var enabledSections: [DocViewSection] = []

    let infoController = DocInfoController()
    let tagTreeController = TagTreeController()
    let scrollController = CustomScrollViewController()
    let quoteListController:QuoteListController
    let chooser = ConspectusChooser()
    let bookListViewController = BookListViewController()
    let linkListViewController = LinkListViewController()

    private var selectedSectionCache: [ConspectusGenus: DocViewSection] = [:]

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        logInfo(tag: .APP, msg: "DocViewModel init")
        quoteListController = QuoteListController(scrollerController: scrollController)
        
        selectedConspectus = AppModel.shared.user
        enabledSections = getEnabledSections(for: .user)
        self.selectedSectionCache[.user] = .books
        self.selectedSectionCache[.author] = .books
        self.selectedSectionCache[.book] = .quotes
        self.selectedSectionCache[.tag] = .links
        $selectedSection
            .removeDuplicates()
            .compactMap { $0 }
            .sink { value in
                self.selectedSectionCache[self.selectedConspectus.genus] = value
            }.store(in: &disposeBag)

        model.$selectedConspectus
            .filter { $0 != nil }
            .map { $0! }
            .removeDuplicates()
            .sink { newValue in
                self.chooser.cancel()
                self.scrollController.update(newValue)
                self.infoController.update(newValue)
                self.bookListViewController.update(newValue)
                self.quoteListController.update(newValue)
                self.tagTreeController.update(newValue)
                self.linkListViewController.update(newValue)

                self.selectedConspectus = newValue
                self.enabledSections = self.getEnabledSections(for: newValue.genus)
                self.selectedSection = self.selectedSectionCache[newValue.genus] ?? .info
            }
            .store(in: &disposeBag)

        model.$selectedConspectus
            .removeDuplicates()
            .compactMap { $0 }
            .flatMap { conspectus in
                conspectus.state.$isEditing
            }
            .removeDuplicates()
            .sink { _ in
                let appDelegate = NSApplication.shared.delegate as! AppDelegate
                appDelegate.window?.makeFirstResponder(nil)

            }.store(in: &disposeBag)
    }

    func getEnabledSections(for genus: ConspectusGenus) -> [DocViewSection] {
        switch genus {
        case .tag:
            return [.info, .links]
        case .author:
            return [.info, .tags, .books, .links]
        case .book:
            return [.info, .tags, .links, .quotesIndex, .quotes]
        case .quote:
            return []
        case .user:
            return [.books]
        }
    }

    var confirmPublisher: AnyCancellable?
    func confirmDelete() {
        confirmPublisher?.cancel()
        confirmPublisher = rootVM.confirmDelete()
            .sink { result in
                print("confirmDelete has result")
                if result == .deleted {
                    self.removeSelectedConspectus()
                }
            }
    }

    func removeSelectedConspectus() {
        model.removeSelectedConspectus()
    }

    func close() {
        model.closeSelectedConspectus()
    }
}
