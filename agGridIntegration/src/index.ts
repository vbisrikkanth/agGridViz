import { Grid, GridOptions, ColDef } from "ag-grid/main";
import { LicenseManager } from "ag-grid-enterprise/main";
import  {License} from "../secret/license";

import "ag-grid/dist/styles/ag-grid.css";
import "ag-grid/dist/styles/ag-theme-balham.css";
import "powerbi-visuals-utils-formattingutils/lib/index.css";
import "../style/custom.css"
import DataView = powerbi.DataView;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

export class SimpleGrid {
  private gridOptions: GridOptions = <GridOptions>{};
  private selectionManager: ISelectionManager;
  private host: IVisualHost;

  constructor(
    eGridDiv: HTMLElement,
    dataView: DataView,
    selectionManager: ISelectionManager,
    host: IVisualHost,
    settings : any
  ) {
    this.selectionManager = selectionManager;
    this.host = host;
    this.gridOptions = this.constructGridOptions(dataView,settings);
    eGridDiv.setAttribute("class", "ag-theme-balham");
    LicenseManager.setLicenseKey( License.KEY);
    console.log(this.gridOptions);
    eGridDiv.innerHTML="";
    new Grid(eGridDiv, this.gridOptions);
  }

  private constructGridOptions(dataView: DataView,settings): GridOptions {
    console.log(settings.tableSettings.enableSorting);
    let gridOptions: GridOptions = {
      columnDefs: this.createColumnDefs(dataView),
      rowData: this.createRowData(dataView),
      rowSelection: "single",
      onRowClicked: event => {
        if(!event.data || !event.data.selectionId){
          return;
        }
        this.selectionManager.select(event.data.selectionId, false).then(
          selectionIds => {
           // console.log(selectionIds);
          },
          reason => {
           // console.log(reason);
          }
        );
      },
      enableSorting: settings.tableSettings.enableSorting,
      enableFilter: settings.tableSettings.enableFiltering
    };
    return gridOptions;
  }

  // specify the columns
  private createColumnDefs(dataView: DataView) {
    let categories = dataView.categorical.categories.map((value, index) => {
      let colDef: ColDef = {
        headerName: value.source.displayName,
        field: value.source.displayName,
        enablePivot: true,
        enableRowGroup: true
      };
      return colDef;
    });

    let measures = dataView.categorical.values.map((value, index) => {
      let groupName = value.source.groupName;
      let colDef: ColDef = {
        headerName: groupName ? groupName.toString() : value.source.displayName,
        field: groupName ? groupName.toString() : value.source.displayName,
        enableValue: true,
        valueFormatter: parameters => {
          //console.log(parameters);
          if(!parameters.data){
            return parameters.value;
          }
          return parameters.data[parameters.colDef.field + "_formattedValue"]
            ? parameters.data[parameters.colDef.field + "_formattedValue"]
            : parameters.value;
        }
      };
      return colDef;
    });

    return categories.concat(measures);
  }

  // specify the data
  private createRowData(dataView: DataView) {
    let rowDefs = [];
    //console.log(dataView);
    let totalRows = dataView.categorical.categories[0].values.length;
    // let formatterMap={}
    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      let rowDef = {};
      let selectionIdBuilder = this.host.createSelectionIdBuilder();
      dataView.categorical.categories.forEach(categoryColumn => {
        selectionIdBuilder = selectionIdBuilder.withCategory(
          categoryColumn,
          rowIndex
        );
        let groupName = categoryColumn.source.groupName;
        let colName = groupName
          ? groupName.toString()
          : categoryColumn.source.displayName;
        rowDef[colName] = categoryColumn.values[rowIndex];
      });
      dataView.categorical.values.forEach(measureColumn => {
        let groupName = measureColumn.source.groupName;
        let colName = groupName
          ? groupName.toString()
          : measureColumn.source.displayName;
        rowDef[colName] = measureColumn.values[rowIndex];
        let iValueFormatter = valueFormatter.create({
          format: measureColumn.source.format
        });
        rowDef[colName + "_formattedValue"] = iValueFormatter.format(
          measureColumn.values[rowIndex]
        );
      });
      rowDef["selectionId"] = selectionIdBuilder.createSelectionId();
      rowDefs.push(rowDef);
    }
    return rowDefs;
  }
}
