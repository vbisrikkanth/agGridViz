import {Grid, GridOptions} from "ag-grid/main";

// for ag-grid-enterprise users only
//import 'ag-grid-enterprise/main';

import "ag-grid/dist/styles/ag-grid.css";
import "ag-grid/dist/styles/ag-theme-balham.css";
import DataView = powerbi.DataView;

export class SimpleGrid {
  private gridOptions: GridOptions = <GridOptions>{};

  constructor(eGridDiv:HTMLElement,dataView:DataView) {
      this.gridOptions = {
          columnDefs: this.createColumnDefs(),
          rowData: this.createRowData()
      };
      console.log(dataView.categorical);
      eGridDiv.setAttribute("class","ag-theme-balham");
      new Grid(eGridDiv, this.gridOptions);
      
  }

  // specify the columns
  private createColumnDefs() {
      return [
          {headerName: "Make", field: "make"},
          {headerName: "Model", field: "model"},
          {headerName: "Price", field: "price"}
      ];
  }

  // specify the data
  private createRowData() {
      return [
          {make: "Toyota", model: "Celica", price: 35000},
          {make: "Ford", model: "Mondeo", price: 32000},
          {make: "Porsche", model: "Boxter", price: 72000}
      ];
  }
}