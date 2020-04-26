//
//  HSeparator.swift
//  Faustus
//
//  Created by Alexander Dittner on 17.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI
struct Separator: View {
    private let color: Color
    private let width: CGFloat
    private let height: CGFloat

    init(color: Color, width: CGFloat = 1, height: CGFloat = 1) {
        self.color = color
        self.width = width
        self.height = height
    }

    var body: some View {
        Rectangle()
            .fill(color)
            .frame(minWidth: 0.5, maxWidth: width, minHeight: 0.5, maxHeight: height)
    }
}
