//
//  DeleteConfirmationController.swift
//  Faustus
//
//  Created by Alexander Dittner on 13.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

enum DeleteResult {
    case deleted
    case canceled
}

class DeleteConfirmationController: ObservableObject, ChooserController {
    @Published var result: DeleteResult = .canceled

    func cancel() {
        result = .canceled
    }

    func apply() {
        result = .deleted
    }
}
