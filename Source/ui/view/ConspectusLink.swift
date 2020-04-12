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
    //let conspectus: Conspectus
    let name: String
    let isEditing: Bool
    let isSelected: Bool
    let height: CGFloat = 30
    let onLinkAction: ((ConspectusLinkAction) -> Void)?

    init(conspectus: Conspectus, isEditing: Bool, isSelected: Bool, level: Int = 0, action: ((ConspectusLinkAction) -> Void)?) {
        //self.conspectus = conspectus
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
        onLinkAction = action
    }

    @State private var hover = false

    var body: some View {
        HStack(alignment: .center, spacing: 0) {
            if isEditing {
                Text(name)
                    .lineLimit(1)
                    .padding(.horizontal, 5)
                    .frame(height: height)
                    .foregroundColor(self.isSelected ? Color.F.white : self.state.isRemoved ? Color.F.red : Color.F.black)
                    .background(self.isSelected ? self.state.isRemoved ? Color.F.red : Color.F.black : Color.F.white)
                    .font(Font.custom(.pragmaticaLight, size: 21))
                    .offset(x: -5, y: 0)
                    .onTapGesture {
                        self.onLinkAction?(.edit)
                    }

                Button("", action: { self.onLinkAction?(.remove) })
                    .buttonStyle(IconButtonStyle(iconName: "smallClose", iconColor: Color.F.white, bgColor: Color.F.black, width: 20, height: 20, radius: 10))
            } else {
                Text(name)
                    .underline(self.hover, color: Color.F.black)
                    .lineLimit(1)
                    .padding(.horizontal, 5)
                    .frame(height: height)
                    .foregroundColor(state.isRemoved ? Color.F.red : Color.F.black)
                    .background(Color.F.white)
                    .font(Font.custom(.pragmaticaLightItalics, size: 21))
                    .onHover { value in self.hover = value }
                    .offset(x: -5, y: 0)
                    .onTapGesture {
                        self.onLinkAction?(.navigate)
                    }
            }
        }
    }
}
