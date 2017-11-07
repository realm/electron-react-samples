import * as React from 'react';
import * as Realm from 'realm';
import * as faker from 'faker';
import { Column } from 'react-data-grid';
import * as ReactDataGrid from 'react-data-grid';

const ProductSchema: Realm.ObjectSchema = {
  primaryKey: 'productId',
  name: 'Product',
  properties: {
    productId: 'int',
    name: 'string',
    price: 'float'
  }
}

const myRealm = new Realm({
  schema: [ProductSchema]
})


export type Product = {
  productId: number,
  name: string,
  price: number
}

const products = myRealm.objects<Product>('Product').filtered('price < 25')

export class App extends React.Component<{}, {}> {

  columns: Column[] = [
    { key: 'productId', name: 'ProductId' },
    { key: 'name', name: 'Name' },
    { key: 'price', name: 'Price' } 
  ];

  timer: NodeJS.Timer

  constructor(props: any){
    super(props)
  }

  componentDidMount() {
    // Update every 1000 products with a new faker data every 200 milliseconds
    this.timer = setInterval(() => {
      myRealm.write(() => {
        for (var index = 0; index < 1000; index++) {
          myRealm.create('Product', {
            productId: index,
            name: faker.commerce.productName(),
            price: faker.random.number({ min: 0, max: 999 })
          }, true)
        }
      })
    }, 200)

    products.addListener(() => {
      this.forceUpdate()
    })
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  rowGetter = (index: number) => {
    return products[index]
  }

  render() {
    return (
      <div>
        <h2>There are {products.length} Products </h2>
        <ReactDataGrid
          columns={this.columns}
          rowGetter={this.rowGetter}
          rowsCount={products.length}
          minHeight={500} />
      </div>
    );
  }
}
