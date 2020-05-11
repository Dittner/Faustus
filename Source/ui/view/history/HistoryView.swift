//
//  ContentView.swift
//  Faustus
//
//  Created by Alexander Dittner on 06.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

struct HistoryView: View {
    @EnvironmentObject var vm: HistoryViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .center, spacing: 0) {
                Spacer()

                Button("") {
                    self.vm.createConspectus(.author)
                }.buttonStyle(CreateButtonStyle(iconName: "author"))

                Button("") {
                    self.vm.createConspectus(.book)
                }.buttonStyle(CreateButtonStyle(iconName: "book"))

                Button("") {
                    self.vm.createConspectus(.tag)
                }.buttonStyle(CreateButtonStyle(iconName: "tag"))

                Spacer()
            }
            .offset(x: 0, y: 10)
            .frame(height: 50)
            .background(Color.F.white)

            Color.F.black
                .frame(height: 50)

            ScrollView(.vertical, showsIndicators: true) {
                VStack(alignment: .leading, spacing: 1) {
                    ForEach(vm.stack, id: \.id) { conspectus in
                        ConspectusRow(action: { _ in self.vm.select(conspectus: conspectus) }, conspectus: conspectus)
                    }
                }
            }
        }
        .fillParent()
    }
}

#if DEBUG
    struct HistoryView_Previews: PreviewProvider {
        static var previews: some View {
            HistoryView()
        }
    }
#endif
