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
    let conspectus: Conspectus
    let name: String
    let details: String
    let isEditing: Bool
    let titleFont: Font
    let detailsFont: Font
    let textColor: Color
    let btnIconColor: Color
    let withDetails: Bool
    let iconName: String
    static let PADDING: CGFloat = 8
    static let HEIGHT: CGFloat = 30
    let onLinkAction: ((ConspectusLinkAction) -> Void)?

    init(conspectus: Conspectus, isEditing: Bool, isLightMode: Bool = true, level: Int = 0,
         withDetails: Bool = true, action: ((ConspectusLinkAction) -> Void)?) {
        self.conspectus = conspectus
        state = conspectus.state
        self.withDetails = withDetails
        name = " \(conspectus.getDescription(detailed: false))"
        details = (conspectus as? Quote)?.text ?? ""
        iconName = (conspectus as? Quote)?.book.content.author?.genus == .user ? "comment" : conspectus.genus.toIconName()

        self.isEditing = isEditing

        textColor = isLightMode ? Color.F.black : Color.F.white
        btnIconColor = isLightMode ? Color.F.white : Color.F.black
        titleFont = Font.custom(withDetails ? .mono : .pragmaticaLightItalics, size: 16)
        detailsFont = Font.custom(.pragmaticaLight, size: 16)

        onLinkAction = action
    }

    @State private var hover = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top, spacing: 0) {
                if withDetails {
                    Image(iconName)
                        .renderingMode(.template)
                        .foregroundColor(self.textColor)
                        .allowsHitTesting(false)
                        .opacity(0.5)
                        .scaleEffect(0.8)
                        .frame(width: 30, height: 30)
                        .background(conspectus.genus.toColor())
                        .cornerRadius(4)
                        .zIndex(1)
                }

                Text("\(name)")
                    .underline(self.hover && !isEditing, color: self.state.isRemoved ? Color.F.red : textColor)
                    .lineLimit(1)
                    .foregroundColor(state.isRemoved ? Color.F.red : textColor)
                    .font(self.titleFont)
                    .padding(.horizontal, withDetails ? ConspectusLink.PADDING : 0)
                    .frame(height: withDetails ? ConspectusLink.HEIGHT : 20, alignment: .center)
                    .background(withDetails ? conspectus.genus.toColor() : Color.F.clear)
                    .cornerRadius(4)
                    .offset(x: withDetails ? -15 : 0)
                    .onHover { value in self.hover = value }
                    .onTapGesture {
                        if !self.isEditing {
                            self.onLinkAction?(.navigate)
                        }
                    }

                Button("", action: { self.onLinkAction?(.remove) })
                    .buttonStyle(IconButtonStyle(iconName: "smallClose", iconColor: btnIconColor, bgColor: Color(conspectus.genus), width: 20, height: 20, radius: 10))
                    .opacity(isEditing ? 1 : 0)
                    .layoutPriority(1)
                    .offset(x: withDetails ? -25 : 0, y: -5)

                if withDetails && !details.isEmpty {
                    Spacer()
                }
            }

            if withDetails && !details.isEmpty {
                Text(details)
                    .foregroundColor(textColor)
                    .lineLimit(nil)
                    .font(self.detailsFont)
                    .padding(.horizontal, ConspectusLink.PADDING)
                    .padding(.top, 5)
                    .padding(.bottom, 10)
                    .frame(maxHeight: .infinity, alignment: .leading)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }.background(withDetails && !details.isEmpty ? Color.F.grayBG : Color.F.clear)
    }
}
