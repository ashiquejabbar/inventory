import { json, redirect, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { Button, ButtonGroup, FormLayout, LegacyCard, Page, TextField, Toast, Frame, Banner } from "@shopify/polaris";
import { db } from "~/utils/db.server";
import { useState, useCallback } from "react";

type LoaderData = {
  product?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  };
  isNew: boolean;
};

export const loader: LoaderFunction = async ({ params }) => {
  if (params.id === "new") {
    return json({ isNew: true });
  }

  const product = await db.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ product, isNew: false });
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await db.product.delete({
      where: { id: params.id },
    });
    return redirect("/");
  }

  const name = formData.get("name") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const price = parseFloat(formData.get("price") as string);

  if (params.id === "new") {
    await db.product.create({
      data: { name, quantity, price },
    });
  } else {
    await db.product.update({
      where: { id: params.id },
      data: { name, quantity, price },
    });
  }

  return redirect("/");
};

export default function ProductForm() {
  const { product, isNew } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";
  
  const [name, setName] = useState(product?.name ?? "");
  const [quantity, setQuantity] = useState(product?.quantity ?? 0);
  const [price, setPrice] = useState(product?.price ?? 0);
  const [showToast, setShowToast] = useState(false);

  const toggleToast = useCallback(() => setShowToast((show) => !show), []);

  const handleSubmit = (e: React.FormEvent) => {
    if (!name.trim()) {
      e.preventDefault();
      return;
    }
    setShowToast(true);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const formData = new FormData();
      formData.append("intent", "delete");
      submit(formData, { method: "post" });
    }
  };

  return (
    <Frame>
      <Page
        title={isNew ? "New Product" : "Edit Product"}
        backAction={{ content: "Products", onAction: () => navigate("/") }}
      >
        {isNew && (
          <Banner
            title="Creating a new product"
            tone="info"
            onDismiss={() => {}}
          >
            <p>Fill in the details below to add a new product to your inventory.</p>
          </Banner>
        )}

        <LegacyCard sectioned>
          <Form method="post" onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                label="Name"
                name="name"
                value={name}
                onChange={setName}
                autoComplete="off"
                error={name.trim() === "" ? "Name is required" : undefined}
                helpText="Enter the product name"
                autoFocus
              />
              <TextField
                label="Quantity"
                type="number"
                name="quantity"
                value={quantity.toString()}
                onChange={(value) => setQuantity(Number(value))}
                autoComplete="off"
                helpText="Available stock quantity"
              />
              <TextField
                label="Price"
                type="number"
                name="price"
                value={price.toString()}
                onChange={(value) => setPrice(Number(value))}
                prefix="$"
                autoComplete="off"
                helpText="Set the product price"
              />
              <ButtonGroup>
                <Button 
                  submit 
                  variant="primary"
                  loading={isSubmitting}
                  disabled={!name.trim() || isSubmitting}
                >
                  {isSubmitting 
                    ? `${isNew ? 'Creating' : 'Updating'}...` 
                    : isNew ? "Create Product" : "Update Product"}
                </Button>
                {!isNew && (
                  <Button 
                    variant="primary"
                    tone="critical"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    Delete Product
                  </Button>
                )}
              </ButtonGroup>
            </FormLayout>
          </Form>
        </LegacyCard>

        {showToast && (
          <Toast
            content={`Product ${isNew ? 'created' : 'updated'} successfully`}
            onDismiss={toggleToast}
            duration={4000}
          />
        )}
      </Page>
    </Frame>
  );
}
