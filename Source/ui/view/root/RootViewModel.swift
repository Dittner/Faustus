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

final class RootViewModel: ViewModel {
    @Published var screen: AppScreen = .login

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        model.userConspectus.asUser!.$isLoggedIn
            .removeDuplicates()
            .map { value in
                value ? .docList : .login
            }
            .assign(to: \.screen, on: self)
            .store(in: &disposeBag)
    }
}
