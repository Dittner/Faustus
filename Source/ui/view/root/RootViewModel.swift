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
    case confirmDestroy
    case no
}

final class RootViewModel: ViewModel {
    @Published var screen: AppScreen = .login
    @Published var isModalViewShown: Bool = false

    static var shared:RootViewModel?
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
    
    func showModalView(type: ModalViewType) {
        isModalViewShown = true
    }
    
    func removeSelectedConspectus() {
        model.removeSelectedConspectus()
    }
}
