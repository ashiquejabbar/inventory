import { json, type LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Button,
  LegacyCard,
  EmptyState,
  ButtonGroup,
  Text,
  Badge,
  Tooltip,
  IndexTable,
  useIndexResourceState,
  Frame,
  Banner
} from "@shopify/polaris";
import { db } from "~/utils/db.server";

type LoaderData = {
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    createdAt: Date;
  }>;
};

export const loader: LoaderFunction = async () => {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return json({ products });
};

export default function Index() {
  const { products } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const { selectedResources, allResourcesSelected, handleSelectionChange } = 
    useIndexResourceState(products);

  if (products.length === 0) {
    return (
      <Page
        title="Inventory"
        primaryAction={
          <Button variant="primary" onClick={() => navigate('/products/new')}>
            Create product
          </Button>
        }
      >
        <EmptyState
          heading="Manage your inventory"
          action={{
            content: 'Create product',
            onAction: () => navigate('/products/new'),
          }}
          image="/empty-state-illustration.svg"
        >
          <p>Track and manage your product inventory efficiently.</p>
        </EmptyState>
      </Page>
    );
  }

  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { status: "critical", label: "Out of stock" };
    if (quantity < 10) return { status: "warning", label: "Low stock" };
    return { status: "success", label: "In stock" };
  };

  const rowMarkup = products.map((product, index) => {
    const stockStatus = getStockStatus(product.quantity);

    return (
      <IndexTable.Row
      position={index}
        id={product.id}
        key={product.id}
        selected={selectedResources.includes(product.id)}
      >
        <IndexTable.Cell>
          <Text as="h3" variant="bodyMd" fontWeight="bold">
            {product.name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Tooltip content={stockStatus.label}>
            <Badge tone={stockStatus.status as "critical" | "warning" | "success"}>
              {product?.quantity.toString()}
            </Badge>
          </Tooltip>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="h3" variant="bodyMd" alignment="start">
            ${product.price.toFixed(2)}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <ButtonGroup>
            <Tooltip content="Edit product">
              <Button
                variant="primary"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                Edit
              </Button>
            </Tooltip>
           
          </ButtonGroup>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Frame>
      <Page
        title="Inventory"
        primaryAction={
          <Button variant="primary" onClick={() => navigate('/products/new')}>
            Create product
          </Button>
        }
      >
        <LegacyCard>
          <IndexTable
            resourceName={resourceName}
            itemCount={products.length}
            selectedItemsCount={
              allResourcesSelected ? 'All' : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: 'Name' },
              { title: 'Quantity' },
              { title: 'Price' },
              { title: 'Actions' },
            ]}
          >
            {rowMarkup}
          </IndexTable>
        </LegacyCard>

   
      </Page>
    </Frame>
  );
}
