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

    let bookListController = BookListController()
    let tagTreeController = TagTreeController()
    let linkListController = LinkListController()
    let quoteListController = QuoteListController()

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        selectedConspectus = AppModel.shared.user

        logInfo(tag: .APP, msg: "DocViewModel init")
        model.$selectedConspectus
            .removeDuplicates()
            .sink { newValue in
                if newValue is BooksOwner {
                    self.bookListController.update(with: (newValue as! BooksOwner).booksColl)
                }
                
                if newValue is Book {
                    self.quoteListController.update(with: newValue as! Book)
                }

                self.tagTreeController.update(newValue, self.model.bibliography)
                self.linkListController.update(with: newValue.linkColl)

                self.selectedConspectus = newValue
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

    func close() {
        model.closeSelectedConspectus()
    }

    var chooseAuthorPublisher: AnyCancellable?
    func chooseAuthor() {
        if let book = selectedConspectus as? Book {
            chooseAuthorPublisher?.cancel()
            chooseAuthorPublisher = rootVM.chooseAuthor()
                .sink { author in
                    print("chooseAuthor has result")
                    author?.booksColl.addBook(book)
                }
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

    var chooseParentTagPublisher: AnyCancellable?
    func chooseParentTag() {
        if let ownerTag = selectedConspectus as? Tag {
            chooseParentTagPublisher?.cancel()
            chooseParentTagPublisher = rootVM.chooseParentTag(owner: ownerTag)
                .sink { tag in
                    print("chooseParentTag has result")
                    ownerTag.content.parentTag = tag
                }
        }
    }

    func removeSelectedConspectus() {
        model.removeSelectedConspectus()
    }
}
