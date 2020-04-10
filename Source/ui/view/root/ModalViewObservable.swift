//
//  ModalViewObservable.swift
//  Faustus
//
//  Created by Alexander Dittner on 10.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

class ModalViewObservable: ObservableObject {
    @Published var isShown: Bool = false
}
