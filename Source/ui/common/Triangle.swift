//
//  Triangle.swift
//  Faustus
//
//  Created by Alexander Dittner on 01.11.2021.
//  Copyright © 2021 Alexander Dittner. All rights reserved.
//

import SwiftUI

struct TriangleShape : Shape {
    
    func path(in rect: CGRect) -> Path {
        var path = Path()

        path.move(to: CGPoint(x : rect.minX, y : rect.maxY))
        path.addLine (to : CGPoint(x: rect.maxX, y : rect.minY))
        path.addLine (to : CGPoint(x: rect.maxX, y : rect.maxY))
        path.addLine (to : CGPoint(x: rect.minX, y : rect.maxY))

        return path
    }
}

struct TriangleView : View {

   var body : some View {

    TriangleShape()
        .fill(Color.F.black)
        .frame(width: 6, height: 6, alignment: .center)
   }
}
