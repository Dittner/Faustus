//
//  Archive.swift
//  Faustus
//
//  Created by Alexander Dittner on 28.05.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

struct SectionView: View {
    @Binding var isExpanded: Bool
    let title: String
    var isEditing: Bool = false
    var action: (() -> Void)?
    let actionBtnIcon: String = "plus"

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .center) {
                if self.isEditing && self.action != nil {
                    Button("", action: self.action!)
                        .buttonStyle(IconButtonStyle(iconName: self.actionBtnIcon, iconColor: Color.F.black, bgColor: Color.F.white, width: 20, height: 20))
                        .offset(x: 10 - geometry.size.width / 2)
                }

                Text(self.title)
                    .lineLimit(1)
                    .font(Font.custom(.pragmaticaSemiBold, size: 21))
                    .foregroundColor(Color.F.black)
                    .padding(.leading, 0)
                    .offset(y: 3)

                Button(action: {
                    self.isExpanded.toggle()
                }) {
                    RoundedRectangle(cornerRadius: 2)
                        .foregroundColor(self.isExpanded ? Color.F.black : Color.F.clear)

                    Image("dropdown")
                        .renderingMode(.template)
                        .foregroundColor(self.isExpanded ? Color.F.white : Color.F.black)
                        .rotationEffect(Angle(degrees: self.isExpanded ? 0 : -90))
                        .allowsHitTesting(false)
                }.buttonStyle(PlainButtonStyle())
                    .frame(width: 20, height: 20)
                    .offset(x: geometry.size.width / 2 - 10)

                Separator(color: Color.F.black, width: .infinity)
                    .offset(y: 15)
            }
        }.frame(height: 40)
            .padding(.bottom, 8)
    }
}
