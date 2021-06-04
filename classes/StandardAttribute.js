/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

const { SpinalGraphService } = require("spinal-env-viewer-graph-service")
const { NODE_TO_CATEGORY_RELATION } = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
const { serviceDocumentation } = require('spinal-env-viewer-plugin-documentation-service')


const {
  SpinalContextApp
} = require("spinal-env-viewer-context-menu-service");
const {
  spinalPanelManagerService
} = require("spinal-env-viewer-panel-manager-service");

class StandardAttribute extends SpinalContextApp {
  constructor() {
    super("initialize standard attributes",
      "This button initialize standard attributes", {
      icon: "my_library_books",
      icon_type: "in",
      backgroundColor: "#FF0000",
      fontColor: "#FFFFFF"
    });
  }
  isShown() {
    return Promise.resolve(true);
  }

  async action() {
    // getGraph
    const graph = SpinalGraphService.getGraph();
    let Buildings;
    let Floors;
    let AllRooms = [];
    // get Contexts
    const contexts = await graph.getChildren("hasContext")
    for (const context of contexts) {
      if (context.getName().get() === "spatial") {
        // get buildings
        Buildings = await context.getChildren("hasGeographicBuilding")
      }
    }
    if (Buildings) {
      for (const building of Buildings) {
        // get floors
        Floors = await building.getChildren("hasGeographicFloor")
      }
    }
    if (Floors) {
      for (const floor of Floors) {
        let Rooms = await floor.getChildren("hasGeographicRoom")
        if (Rooms) {
          for (const room of Rooms) {
            // get rooms
            AllRooms.push(room)
          }
        }
      }
    }
    // interface attributes
    var infoAttributes = {
      attributeLabel: "capacity",
      attributeType: "number",
      attributeUnit: "",
    }


    // for (const room of AllRooms) {
    //   let categoryAttributesList = await room.getChildren(NODE_TO_CATEGORY_RELATION);
    //   for (const category of categoryAttributesList) {
    //     if (category.getName().get() === "Standard Attributes") {
    //       serviceDocumentation.removeNode(category);
    //     }
    //   }
    // }






    // list Of Categories attributes
    for (const room of AllRooms) {
      var _room = room
      let categoryAttributesList = await room.getChildren(NODE_TO_CATEGORY_RELATION);
      if (categoryStandardAttributesExist(categoryAttributesList) === false) {
        await serviceDocumentation.addCategoryAttribute(_room, "Standard Attributes").then(async (result) => {
          let categoryResult = result.node
          let cap = await calculCapacity(categoryAttributesList)
          await serviceDocumentation.addAttributeByCategoryName(_room, categoryResult.getName().get(), infoAttributes.attributeLabel, cap, infoAttributes.attributeType, infoAttributes.attributeUnit)
        })
      } else {
        for (const category of categoryAttributesList) {
          if (category.getName().get() === "Standard Attributes") {
            let cap = calculCapacity(categoryAttributesList)
            let attributes = (await category.element.load()).get();
            if (!attributeCapacityExist(attributes)) {
              await serviceDocumentation.addAttributeByCategoryName(_room, category.getName().get(), infoAttributes.attributeLabel, cap, infoAttributes.attributeType, infoAttributes.attributeUnit)
            }
          }
        }
      }
    }
    function attributeCapacityExist(attributes) {
      for (const attr of attributes) {
        if (attr.label === "capacity") return true
        else return false
      }
    }
    function categoryStandardAttributesExist(categoryAttributesList) {
      for (const category of categoryAttributesList) {
        if (category.getName().get() === "Standard Attributes") return true
        else return false
      }
    }
    async function calculCapacity(categoryAttributesList) {
      for (const category of categoryAttributesList) {
        if (category.getName().get() === "Spatial") {
          const attributes = (await category.element.load()).get();
          for (const attribute of attributes) {
            if (attribute.label === "area") {
              return Math.round(attribute.value / 5)
            }
          }
        }
      }
    }

  }
}

module.exports = StandardAttribute;
