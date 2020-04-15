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
    case remove
    case navigate
}

struct ConspectusLink: View {
    @ObservedObject var state: ConspectusState
    let name: String
    let details: String
    let isEditing: Bool
    let font: Font
    let textColor: Color
    let btnIconColor: Color
    let height: CGFloat
    let showDetails: Bool
    let onLinkAction: ((ConspectusLinkAction) -> Void)?

    init(conspectus: Conspectus, isEditing: Bool, fontSize: CGFloat = 21, height: CGFloat = 30, isLightMode: Bool = true, level: Int = 0, showDetails: Bool = false, action: ((ConspectusLinkAction) -> Void)?) {
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

        textColor = isLightMode ? Color.F.black : Color.F.white
        btnIconColor = isLightMode ? Color.F.white : Color.F.black
        self.height = height
        self.showDetails = showDetails
        font = Font.custom(showDetails ? .pragmaticaSemiBold : isEditing ? .pragmaticaLight : .pragmaticaLightItalics, size: fontSize)
        details = ""
        onLinkAction = action
    }

    @State private var hover = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center, spacing: 5) {
                if showDetails {
                    Spacer().frame(width: 35)

                    Image("link")
                        .renderingMode(.template)
                        .allowsHitTesting(false)
                        .foregroundColor(state.isRemoved ? Color.F.red : textColor)
                }

                Text(" \(name)")
                    .underline(self.hover && !isEditing, color: self.state.isRemoved ? Color.F.red : textColor)
                    .lineLimit(1)
                    .frame(height: height)
                    .foregroundColor(state.isRemoved ? Color.F.red : textColor)
                    .font(self.font)
                    .onHover { value in self.hover = value }
                    .onTapGesture {
                        if !self.isEditing {
                            self.onLinkAction?(.navigate)
                        }
                    }

                if showDetails {
                    Spacer()
                }

                if isEditing {
                    Button("", action: { self.onLinkAction?(.remove) })
                        .buttonStyle(IconButtonStyle(iconName: "smallClose", iconColor: btnIconColor, bgColor: textColor, width: 20, height: 20, radius: 10))
                }

                if !showDetails {
                    Spacer()
                }
            }

            if showDetails && !details.isEmpty {
                Text(details)
                    .padding(.horizontal, 5)
                    .foregroundColor(textColor)
                    .font(Font.custom(.pragmaticaLight, size: 21))
                    .offset(x: -5, y: 0)
            }
        }.padding(.vertical, showDetails ? 5 : 0)
            .background(showDetails ? Color.F.inputBG : Color.clear)
    }
}
