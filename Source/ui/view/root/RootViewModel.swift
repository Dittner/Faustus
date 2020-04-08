//
//  LoginViewModel.swift
//  Faustus
//
//  Created by Alexander Dittner on 17.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

enum AppScreen: String {
    case login
    case docList
}

enum ModalViewType: String {
    case confirmDelete
    case chooseBooks
    case chooseAuthor
    case no
}

final class RootViewModel: ViewModel {
    @Published var screen: AppScreen = .login
    @Published var modalView: ModalViewType = .no
    @Published var keyLinesShown: Bool = false

    @Published var deleteConfirmationController: DeleteConfirmationController = DeleteConfirmationController()
    @Published var booksChooserController: BooksChooserController = BooksChooserController()

    static var shared: RootViewModel?
    private var disposeBag: Set<AnyCancellable> = []

    init() {
        RootViewModel.shared = self
        model.$state
            .removeDuplicates()
            .map { value in
                value == .auth ? .login : .docList
            }
            .assign(to: \.screen, on: self)
            .store(in: &disposeBag)
    }

    func confirmDelete() -> AnyPublisher<DeleteResult, Never> {
        modalView = .confirmDelete

        let p = Future<DeleteResult, Never> { promise in
            self.deleteConfirmationController.$result
                .dropFirst()
                .sink { result in
                    switch result {
                    case .deleted:
                        promise(.success(result))
                        self.modalView = .no
                    case .canceled:
                        promise(.success(result))
                        self.modalView = .no
                    }
                }
                .store(in: &self.disposeBag)
        }
        return p.eraseToAnyPublisher()
    }

    func chooseBooks(selectedBooks: [Conspectus]) -> AnyPublisher<[Conspectus], Never> {
        modalView = .chooseBooks
        booksChooserController.update(selectedBooks, bibliography: model.bibliography)

        let p = Future<[Conspectus], Never> { promise in
            self.booksChooserController.$result
                .dropFirst()
                .sink { result in
                    switch result {
                    case let .selected(result):
                        promise(.success(result))
                        self.modalView = .no

                    case .canceled:
                        promise(.success(selectedBooks))
                        self.modalView = .no
                    }
                }
                .store(in: &self.disposeBag)
        }
        return p.eraseToAnyPublisher()
    }
}

enum DeleteResult {
    case deleted
    case canceled
}

class DeleteConfirmationController: ObservableObject {
    @Published var result: DeleteResult = .canceled

    func cancel() {
        result = .canceled
    }

    func apply() {
        result = .deleted
    }
}

class BooksChooserController: ObservableObject {
    enum ChooserResult {
        case selected(_ result: [Conspectus])
        case canceled
    }

    @Published var selectedBooks: [Conspectus] = []
    @Published var allBooks: [Conspectus] = []
    @Published var result: ChooserResult = .canceled

    func update(_ selectedBooks: [Conspectus], bibliography: Bibliography) {
        self.selectedBooks = selectedBooks

        allBooks = bibliography.getValues()
            .filter { $0.genus == .asBook && !$0.isRemoved }
            .sorted { $0.asBook!.writtenDate > $1.asBook!.writtenDate }

        print("Books toral = \(allBooks.count)")
    }

    func cancel() {
        result = .canceled
    }

    func apply() {
        result = .selected(selectedBooks)
    }
}
