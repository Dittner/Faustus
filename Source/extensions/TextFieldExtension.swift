//
//  NSColorExtension.swift
//  Faustus
//
//  Created by Alexander Dittner on 27.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI
extension TextField where Label == Text {
    public init(_ titleKey: LocalizedStringKey, text: Binding<String>, isFocused: Binding<Bool>, onEditingChanged: @escaping (Bool) -> Void) {
        self.init(titleKey, text: text, onEditingChanged: onEditingChanged)
    }
}
