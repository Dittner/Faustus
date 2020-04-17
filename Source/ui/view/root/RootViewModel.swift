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

enum ModalViewCategory: String {
    case no
    case deleteConfirmation
    case booksChooser
    case authorChooser
    case parentTagChooser
    case tagsChooser
}

func notify(msg:String) {
    RootViewModel.shared?.notificationController.msg = msg
}

final class RootViewModel: ViewModel {
    @Published var screen: AppScreen = .login
    @Published var keyLinesShown: Bool = false
    @Published var modalView: ModalViewCategory = .no

    var deleteConfirmationController: DeleteConfirmationController = DeleteConfirmationController()
    var booksChooserController: BooksChooserController = BooksChooserController()
    var authorChooserController: AuthorChooserController = AuthorChooserController()
    var parentTagChooserController: ParentTagChooserController = ParentTagChooserController()
    var tagsChooserController: TagsChooserController = TagsChooserController()
    var notificationController: NotificationController = NotificationController()

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
        modalView = .deleteConfirmation

        let p = Future<DeleteResult, Never> { promise in
            self.deleteConfirmationController.$result
                .dropFirst()
                .sink { result in
                    switch result {
                    case .deleted:
                        promise(.success(result))
                    case .canceled:
                        promise(.success(result))
                    }
                    self.modalView = .no
                }
                .store(in: &self.disposeBag)
        }
        return p.eraseToAnyPublisher()
    }

    func chooseBooks(selectedBooks: [Book]) -> AnyPublisher<[Book], Never> {
        modalView = .booksChooser
        booksChooserController.show(selectedBooks, bibliography: model.bibliography)

        let p = Future<[Book], Never> { promise in
            self.booksChooserController.$result
                .dropFirst()
                .sink { result in
                    switch result {
                    case let .selected(result):
                        promise(.success(result))

                    case .canceled:
                        promise(.success(selectedBooks))
                    }
                    self.modalView = .no
                }
                .store(in: &self.disposeBag)
        }
        return p.eraseToAnyPublisher()
    }

    func chooseAuthor() -> AnyPublisher<Author?, Never> {
        modalView = .authorChooser
        authorChooserController.show(model.bibliography)

        let p = Future<Author?, Never> { promise in
            self.authorChooserController.$result
                .dropFirst()
                .sink { result in
                    switch result {
                    case let .selected(result):
                        promise(.success(result))

                    case .canceled:
                        promise(.success(nil))
                    }
                    self.modalView = .no
                }
                .store(in: &self.disposeBag)
        }
        return p.eraseToAnyPublisher()
    }

    func chooseParentTag(owner: Tag) -> AnyPublisher<Tag?, Never> {
        modalView = .parentTagChooser
        parentTagChooserController.show(owner, model.bibliography)

        let p = Future<Tag?, Never> { promise in
            self.parentTagChooserController.$result
                .dropFirst()
                .sink { result in
                    switch result {
                    case let .selected(result):
                        promise(.success(result))

                    case .canceled:
                        promise(.success(nil))
                    }
                    self.modalView = .no
                }
                .store(in: &self.disposeBag)
        }
        return p.eraseToAnyPublisher()
    }
    
    func chooseTags(owner: Conspectus) -> AnyPublisher<([Tag],[Tag]), Never> {
        modalView = .tagsChooser
        tagsChooserController.show(owner, model.bibliography)

        let p = Future<([Tag],[Tag]), Never> { promise in
            self.tagsChooserController.$result
                .dropFirst()
                .sink { result in
                    switch result {
                    case let .selected(added, removed):
                        promise(.success((added, removed)))

                    case .canceled:
                        promise(.success(([], [])))
                    }
                    self.modalView = .no
                }
                .store(in: &self.disposeBag)
        }
        return p.eraseToAnyPublisher()
    }
}
