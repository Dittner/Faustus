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
    @Published var selectedConspectusState: ConspectusState

    let infoController = DocInfoController()

    let tagTreeController = TagTreeController()
    let quoteListController = QuoteListController()
    let chooser = ConspectusChooser()
    let scrollController = CustomScrollViewController()

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        selectedConspectus = AppModel.shared.user
        selectedConspectusState = AppModel.shared.user.state

        logInfo(tag: .APP, msg: "DocViewModel init")
        model.$selectedConspectus
            .filter { $0 != nil }
            .map { $0! }
            .removeDuplicates()
            .sink { newValue in
                self.chooser.cancel()
                self.scrollController.update(newValue)
                self.infoController.update(newValue)
                self.quoteListController.update(newValue)
                self.tagTreeController.update(newValue)

                self.selectedConspectus = newValue
                self.selectedConspectusState = newValue.state
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
