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
}

func notify(msg:String) {
    RootViewModel.shared?.notificationController.msg = msg
}

final class RootViewModel: ViewModel {
    @Published var screen: AppScreen = .login
    @Published var keyLinesShown: Bool = false
    @Published var modalView: ModalViewCategory = .no

    var deleteConfirmationController: DeleteConfirmationController = DeleteConfirmationController()
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
}
