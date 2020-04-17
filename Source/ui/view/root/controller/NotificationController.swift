//
//  NotificationController.swift
//  Faustus
//
//  Created by Alexander Dittner on 17.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class NotificationController: ObservableObject {
    @Published var msg: String = ""
    @Published var isShown: Bool = false
    private var disposeBag: Set<AnyCancellable> = []

    init() {
        $msg
            .sink { _ in
                self.isShown = true
            }.store(in: &disposeBag)

        $msg
            .debounce(for: 2, scheduler: RunLoop.main)
            .sink { _ in
                withAnimation(.easeInOut(duration: 1.0)) {
                    self.isShown = false
                }
            }.store(in: &disposeBag)
    }
}
