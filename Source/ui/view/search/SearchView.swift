//
//  ContentView.swift
//  Faustus
//
//  Created by Alexander Dittner on 06.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

struct SearchView: View {
    @ObservedObject private var vm = SearchViewModel()

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 0) {
                Image("search")
                    .renderingMode(.template)
                    .foregroundColor(Color.F.black)
                    .frame(width: 50)

                TextInput(title: "", text: $vm.filterText, textColor: NSColor.F.black, font: NSFont(name: .pragmaticaLight, size: 21), alignment: .left, isFocused: false, isSecure: false, format: nil, isEditable: true, onEnterAction: nil)
                    .frame(height: 50, alignment: .leading)
                    .padding(.horizontal, -5)
                    .saturation(0)
                    .colorScheme(.light)
            }
            .offset(x: 0, y: 11)
            .frame(height: 50)
            .background(Color.F.white)

            HStack(alignment: .center, spacing: 10) {
                Spacer()

                FilterTabBar(selectedFilter: $vm.selectedFilter)
                    .cornerRadius(2)

                Spacer()
            }
            .padding(.trailing, 15)
            .frame(height: 50)
            .background(Color.F.black)

            ScrollView(.vertical, showsIndicators: true) {
                VStack(alignment: .leading, spacing: 1) {
                    ForEach(vm.result, id: \.id) { conspectus in
                        ConspectusRow(action: { self.vm.select(conspectus: conspectus) }, conspectus: conspectus).frame(height: 50)
                    }
                }
            }
        }

        .fillParent()
    }
}

struct FilterTabBar: View {
    @Binding var selectedFilter: SearchFilter

    var body: some View {
        HStack(alignment: .center, spacing: 1) {
            Image("smallAuthor")
                .renderingMode(.template)
                .frame(width: 50, height: 30)
                .foregroundColor(self.selectedFilter == .authors ? Color.F.dark : Color.F.gray)
                .background(self.selectedFilter == .authors ? Color.F.gray : Color.F.dark)
                .onTapGesture {
                    self.selectedFilter = .authors
                }

            Image("smallBook")
                .renderingMode(.template)
                .frame(width: 50, height: 30)
                .foregroundColor(self.selectedFilter == .books ? Color.F.dark : Color.F.gray)
                .background(self.selectedFilter == .books ? Color.F.gray : Color.F.dark)
                .onTapGesture {
                    self.selectedFilter = .books
                }

            Image("smallTag")
                .renderingMode(.template)
                .frame(width: 50, height: 30)
                .foregroundColor(self.selectedFilter == .tags ? Color.F.dark : Color.F.gray)
                .background(self.selectedFilter == .tags ? Color.F.gray : Color.F.dark)
                .onTapGesture {
                    self.selectedFilter = .tags
                }

            Image("smallQuote")
                .renderingMode(.template)
                .frame(width: 50, height: 30)
                .foregroundColor(self.selectedFilter == .quotes ? Color.F.dark : Color.F.gray)
                .background(self.selectedFilter == .quotes ? Color.F.gray : Color.F.dark)
                .onTapGesture {
                    self.selectedFilter = .quotes
                }
        }
    }
}

#if DEBUG
    struct SearchView_Previews: PreviewProvider {
        static var previews: some View {
            SearchView()
        }
    }
#endif
