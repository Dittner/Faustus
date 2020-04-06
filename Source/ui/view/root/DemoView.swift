//
//  DemoView.swift
//  Faustus
//
//  Created by Alexander Dittner on 28.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import Foundation
import SwiftUI

struct DemoView: View {
    var body: some View {
        Text("Options")
            .contextMenu {
                Button(action: {
                    // change country setting
                }) {
                    Text("Choose Author")
                    Image("author")
                }

                Button(action: {
                    // enable geolocation
                }) {
                    Text("Detect Location")
                    Image("book")
                }
            }
    }
}
