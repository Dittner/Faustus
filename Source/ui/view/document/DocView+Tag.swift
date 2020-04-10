//
//  DocView+Tag.swift
//  Faustus
//
//  Created by Alexander Dittner on 05.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

struct ParentTag: View {
    @ObservedObject var controller: TagTreeController
    @ObservedObject var conspectus: Conspectus
    @ObservedObject var curTag: Tag
    let tagNodes: [TagTreeNode]
    @State private var isExpanded: Bool = true
    private var disposeBag: Set<AnyCancellable> = []

    init(controller: TagTreeController) {
        self.controller = controller
        conspectus = controller.conspectus
        curTag = controller.conspectus.asTag!
        tagNodes = controller.tagTree.compactTree { $0.id != controller.conspectus.id }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Section(isExpanded: $isExpanded, title: "SUPERTAG")

            if isExpanded {
                if conspectus.isEditing {
                    ForEach(tagNodes, id: \.id) { node in
                        TagTreeNodeLink(node: node, isEditing: true, isSelected: self.curTag.parentTag?.id == node.id, action: {
                            action in
                            if action == .edit {
                                self.curTag.parentTag = self.curTag.parentTag?.id == node.id ? nil : node.conspectus
                            }
                        })
                            .font(Font.custom(.pragmaticaLightItalics, size: 21))

                    }.padding(.leading, 40)
                        .padding(.trailing, 20)
                } else if self.curTag.parentTag != nil {
                    ConspectusLink(conspectus: self.curTag.parentTag!, isEditing: false, isSelected: false, action: { action in
                        if action == .navigate {
                            self.curTag.parentTag?.show()
                        }
                    })
                        .font(Font.custom(.pragmaticaLightItalics, size: 21))
                        .padding(.leading, 40)
                } else {
                    Text("Kein")
                        .font(Font.custom(.pragmaticaLight, size: 21))
                        .foregroundColor(Color.F.black05)
                        .padding(.leading, 40)
                }
            }
        }
    }
}

struct TagTreeNodeLink: View {
    @ObservedObject var conspectus: Conspectus
    private let node: TagTreeNode
    let name: String
    let isEditing: Bool
    let isSelected: Bool
    let levelOffset: CGFloat
    let levelWidth: Int = 50
    let height: CGFloat = 30
    let onLinkAction: ((ConspectusLinkAction) -> Void)?

    init(node: TagTreeNode, isEditing: Bool, isSelected: Bool, action: ((ConspectusLinkAction) -> Void)?) {
        self.node = node
        conspectus = node.conspectus
        switch node.conspectus.genus {
        case .asAuthor:
            name = "\(node.conspectus.asAuthor!.surname) \(node.conspectus.asAuthor!.initials)"
        case .asBook:
            name = "\(node.conspectus.asBook!.title), \(node.conspectus.asBook!.authorText), \(node.conspectus.asBook!.writtenDate)"
        case .asTag:
            name = node.conspectus.asTag!.name
        default:
            name = "Unknown Conspectus genus"
        }

        self.isEditing = isEditing
        self.isSelected = isSelected
        levelOffset = CGFloat(node.level * levelWidth)
        onLinkAction = action
    }

    @State private var hover = false

    var body: some View {
        HStack(alignment: .top, spacing: 0) {
            if isEditing {
                TreeNodeLines(node: node, levelWidth: levelWidth)
                    .stroke()
                    .foregroundColor(Color.F.black)
                    .opacity(0.25)
                    .frame(width: levelOffset, height: height)

                Text(name)
                    .lineLimit(1)
                    .padding(.horizontal, 5)
                    .frame(height: height)
                    .foregroundColor(self.isSelected ? Color.F.white : self.conspectus.isRemoved ? Color.F.red : Color.F.black)
                    .background(self.isSelected ? self.conspectus.isRemoved ? Color.F.red : Color.F.black : Color.F.white)
                    .font(Font.custom(.pragmaticaLight, size: 21))
                    .offset(x: -5, y: 0)
                    .onTapGesture {
                        self.onLinkAction?(.edit)
                    }
            } else {
                Text(name)
                    .underline(self.hover, color: Color.F.black)
                    .lineLimit(1)
                    .padding(.horizontal, 5)
                    .frame(height: height)
                    .foregroundColor(conspectus.isRemoved ? Color.F.red : Color.F.black)
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

struct TreeNodeLines: Shape {
    let node: TagTreeNode
    let levelWidth: Int
    func path(in rect: CGRect) -> Path {
        var path = Path()
        if rect.width > 0 {
            let linesAmount = Int(rect.width) / levelWidth

            for i in 0 ... linesAmount {
                path.move(to: CGPoint(x: i * levelWidth + levelWidth / 2, y: 0))
                path.addLine(to: CGPoint(x: i * levelWidth + levelWidth / 2, y: Int(rect.height)))
            }

            path.move(to: CGPoint(x: Int(rect.width - CGFloat(levelWidth / 2)), y: Int(rect.height / 2)))
            path.addLine(to: CGPoint(x: Int(rect.width - 2), y: Int(rect.height / 2)))
        }

        return path
    }
}
