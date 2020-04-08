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
    @Published var selectedConspectus: Conspectus = Conspectus(genus: .asUser)

    let tagTreeController = TagTreeController()
    let bookListController = BookListController()

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        logInfo(tag: .APP, msg: "DocViewModel init")
        model.$selectedConspectus
            .removeDuplicates()
            .sink { newValue in
                self.bookListController.update(conspectus: newValue)
                self.tagTreeController.update(conspectus: newValue)
                
                self.selectedConspectus = newValue
            }
            .store(in: &disposeBag)

        model.$selectedConspectus
            .removeDuplicates()
            .compactMap { $0 }
            .flatMap { conspectus in
                conspectus.$isEditing
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

    func select(_ conspectus: Conspectus) {
        model.select(conspectus)
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
}
