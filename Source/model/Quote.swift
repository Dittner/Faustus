//
//  Quote.swift
//  Faustus
//
//  Created by Alexander Dittner on 22.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import Foundation
import SwiftUI

class Quote: ObservableObject {
    let id: UID = UID()
    @Published var text: String = "Neues Zitat"
    @Published var startPage: String = ""
    @Published var endPage: String = ""
}
