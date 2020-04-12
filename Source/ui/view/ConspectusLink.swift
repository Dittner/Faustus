//
//  ConspectusLink.swift
//  Faustus
//
//  Created by Alexander Dittner on 09.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

enum ConspectusLinkAction: Int {
    case edit
    case remove
    case navigate
}

struct ConspectusLink: View {
    @ObservedObject var state: ConspectusState
    let name: String
    let isEditing: Bool
    let isSelected: Bool
    let fontSize: CGFloat
    let textColor: Color
    let selectedTextColor: Color
    let btnIconColor: Color
    let height: CGFloat
    let onLinkAction: ((ConspectusLinkAction) -> Void)?

    init(conspectus: Conspectus, isEditing: Bool, isSelected: Bool, fontSize:CGFloat = 21, height:CGFloat = 30, isLightMode:Bool = true, level: Int = 0, action: ((ConspectusLinkAction) -> Void)?) {
        state = conspectus.state
        switch conspectus.genus {
        case .author:
            name = "\((conspectus as! Author).content.surname) \((conspectus as! Author).content.initials)"
        case .book:
            name = "\((conspectus as! Book).content.title), \((conspectus as! Book).content.authorText), \((conspectus as! Book).content.writtenDate)"
        case .tag:
            name = (conspectus as! Tag).content.name
        default:
            name = "Unknown Conspectus genus"
        }

        self.isEditing = isEditing
        self.isSelected = isSelected
        self.fontSize = fontSize
        
        self.textColor = isLightMode ? Color.F.black : Color.F.white
        self.selectedTextColor = isLightMode ? Color.F.white : Color.F.black
        self.btnIconColor = isLightMode ? Color.F.white : Color.F.black
        self.height = height
        onLinkAction = action
    }

    @State private var hover = false

    var body: some View {
        HStack(alignment: .center, spacing: 0) {
            if isEditing {
                Text(" \(name)")
                    .lineLimit(1)
                    .padding(.horizontal, 5)
                    .frame(height: height)
                    .foregroundColor(self.isSelected ? selectedTextColor : self.state.isRemoved ? Color.F.red : textColor)
                    .background(self.isSelected ? self.state.isRemoved ? Color.F.red : Color.F.black : Color.F.clear)
                    .font(Font.custom(.pragmaticaLight, size: fontSize))
                    .offset(x: -5, y: 0)
                    .onTapGesture {
                        self.onLinkAction?(.edit)
                    }

                Button("", action: { self.onLinkAction?(.remove) })
                    .buttonStyle(IconButtonStyle(iconName: "smallClose", iconColor: btnIconColor, bgColor: textColor, width: 20, height: 20, radius: 10))
            } else {
                Text(" \(name)")
                    .underline(self.hover, color: self.state.isRemoved ? Color.F.red : textColor)
                    .lineLimit(1)
                    .padding(.horizontal, 5)
                    .frame(height: height)
                    .foregroundColor(state.isRemoved ? Color.F.red : textColor)
                    .font(Font.custom(.pragmaticaLightItalics, size: fontSize))
                    .onHover { value in self.hover = value }
                    .offset(x: -5, y: 0)
                    .onTapGesture {
                        self.onLinkAction?(.navigate)
                    }
            }
            
            Spacer()
        }
    }
}
