import { Hono } from "hono";
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { v4 as uuidv4 } from 'uuid';

type Bindings = {
  DB: D1Database,
  R2: R2Bucket,
}

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS globally
app.use('*', cors({
  origin: '*',                 // allow all origins (or specify your frontend URL)
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Swagger UI endpoint
app.get('/docs', swaggerUI({ url: '/api-docs' }));

// OpenAPI specification
app.get('/api-docs', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'Hair Shop API',
      version: '1.0.0',
      description: 'API for managing hair shop products, variants, colors, and images'
    },
    servers: [
      {
        url: 'https://api.perukytyt.com',
        description: 'Production server'
      }
    ],
    paths: {
      '/v1/colors': {
        get: {
          tags: ['Colors'],
          summary: 'Get all colors',
          responses: {
            '200': {
              description: 'List of all colors',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      colors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            display_name: { type: 'string' },
                            color_category: { type: 'number' },
                            created_at: { type: 'string' },
                            updated_at: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '500': { description: 'Internal server error' }
          }
        },
        post: {
          tags: ['Colors'],
          summary: 'Create a new color',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', description: 'Color name' },
                    display_name: { type: 'string', description: 'Display name for the color' },
                    color_category: { type: 'number', description: 'Color category number' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Color created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      color: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          display_name: { type: 'string' },
                          color_category: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request - missing required fields' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/v1/products': {
        get: {
          tags: ['Products'],
          summary: 'Get all products',
          responses: {
            '200': {
              description: 'List of all products',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      products: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            category: { type: 'string' },
                            type: { type: 'string' },
                            length: { type: 'number' },
                            description: { type: 'string' },
                            variants: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string' },
                                  color: { type: 'string' },
                                  price: { type: 'number' },
                                  promo_price: { type: 'number' },
                                  availability: { type: 'boolean' },
                                  images: { type: 'array', items: { type: 'string' } }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '500': { description: 'Internal server error' }
          }
        },
        post: {
          tags: ['Products'],
          summary: 'Create a new product',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'category_id'],
                  properties: {
                    name: { type: 'string', description: 'Product name (must be unique)' },
                    display_name: { type: 'string', description: 'Display name for the product' },
                    description: { type: 'string', description: 'Product description' },
                    short_description: { type: 'string', description: 'Short product description' },
                    type: { type: 'string', description: 'Product type' },
                    length: { type: 'number', description: 'Product length' },
                    base_price: { type: 'number', description: 'Base price' },
                    base_promo_price: { type: 'number', description: 'Base promotional price' },
                    category_id: { type: 'number', description: 'Category ID' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Product created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      product: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          display_name: { type: 'string' },
                          description: { type: 'string' },
                          short_description: { type: 'string' },
                          type: { type: 'string' },
                          length: { type: 'number' },
                          base_price: { type: 'number' },
                          base_promo_price: { type: 'number' },
                          category_id: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request - missing required fields' },
            '409': { description: 'Conflict - product name already exists' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/v1/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get a single product by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Product ID'
            }
          ],
          responses: {
            '200': {
              description: 'Product details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      product: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          category: { type: 'string' },
                          type: { type: 'string' },
                          length: { type: 'number' },
                          description: { type: 'string' },
                          variants: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                color: { type: 'string' },
                                price: { type: 'number' },
                                promo_price: { type: 'number' },
                                availability: { type: 'boolean' },
                                images: { type: 'array', items: { type: 'string' } }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '404': { description: 'Product not found' },
            '500': { description: 'Internal server error' }
          }
        },
        put: {
          tags: ['Products'],
          summary: 'Update a product',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Product ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Product name' },
                    display_name: { type: 'string', description: 'Display name for the product' },
                    description: { type: 'string', description: 'Product description' },
                    short_description: { type: 'string', description: 'Short product description' },
                    type: { type: 'string', description: 'Product type' },
                    length: { type: 'number', description: 'Product length' },
                    base_price: { type: 'number', description: 'Base price' },
                    base_promo_price: { type: 'number', description: 'Base promotional price' },
                    category_id: { type: 'number', description: 'Category ID' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Product updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      product: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          display_name: { type: 'string' },
                          description: { type: 'string' },
                          short_description: { type: 'string' },
                          type: { type: 'string' },
                          length: { type: 'number' },
                          base_price: { type: 'number' },
                          base_promo_price: { type: 'number' },
                          category_id: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request - invalid data' },
            '404': { description: 'Product not found' },
            '409': { description: 'Conflict - product name already exists' },
            '500': { description: 'Internal server error' }
          }
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete a product',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Product ID'
            }
          ],
          responses: {
            '200': {
              description: 'Product deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            '404': { description: 'Product not found' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/v1/variants': {
        get: {
          tags: ['Variants'],
          summary: 'Get all variants',
          responses: {
            '200': {
              description: 'List of all variants',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      variants: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            product_id: { type: 'string' },
                            sku: { type: 'string' },
                            price: { type: 'number' },
                            promo_price: { type: 'number' },
                            color: { type: 'string' },
                            stock_quantity: { type: 'number' },
                            availability: { type: 'boolean' },
                            images: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string' },
                                  url: { type: 'string' },
                                  sort_order: { type: 'number' }
                                }
                              }
                            },
                            created_at: { type: 'string' },
                            updated_at: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '500': { description: 'Internal server error' }
          }
        },
        post: {
          tags: ['Variants'],
          summary: 'Create a new variant',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['product_id'],
                  properties: {
                    product_id: { type: 'string', description: 'Product ID' },
                    sku: { type: 'string', description: 'SKU' },
                    price: { type: 'string', description: 'Price' },
                    promo_price: { type: 'string', description: 'Promotional price' },
                    color: { type: 'string', description: 'Color' },
                    stock_quantity: { type: 'string', description: 'Stock quantity' },
                    images: {
                      type: 'array',
                      items: { type: 'string', format: 'binary' },
                      description: 'Image files'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Variant created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      variant: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          product_id: { type: 'string' },
                          sku: { type: 'string' },
                          price: { type: 'number' },
                          promo_price: { type: 'number' },
                          color: { type: 'string' },
                          stock_quantity: { type: 'number' },
                          images: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                url: { type: 'string' },
                                sort_order: { type: 'number' }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request - missing required fields' },
            '404': { description: 'Product not found' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/v1/variants/{id}': {
        get: {
          tags: ['Variants'],
          summary: 'Get a single variant by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Variant ID'
            }
          ],
          responses: {
            '200': {
              description: 'Variant details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      variant: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          product_id: { type: 'string' },
                          sku: { type: 'string' },
                          price: { type: 'number' },
                          promo_price: { type: 'number' },
                          color: { type: 'string' },
                          stock_quantity: { type: 'number' },
                          availability: { type: 'boolean' },
                          images: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                url: { type: 'string' },
                                sort_order: { type: 'number' }
                              }
                            }
                          },
                          created_at: { type: 'string' },
                          updated_at: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '404': { description: 'Variant not found' },
            '500': { description: 'Internal server error' }
          }
        },
        put: {
          tags: ['Variants'],
          summary: 'Update a variant',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Variant ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sku: { type: 'string', description: 'SKU' },
                    price: { type: 'number', description: 'Price' },
                    promo_price: { type: 'number', description: 'Promotional price' },
                    color: { type: 'string', description: 'Color' },
                    stock_quantity: { type: 'number', description: 'Stock quantity' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Variant updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      variant: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          product_id: { type: 'string' },
                          sku: { type: 'string' },
                          price: { type: 'number' },
                          promo_price: { type: 'number' },
                          color: { type: 'string' },
                          stock_quantity: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request - invalid data' },
            '404': { description: 'Variant not found' },
            '500': { description: 'Internal server error' }
          }
        },
        delete: {
          tags: ['Variants'],
          summary: 'Delete a variant',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Variant ID'
            }
          ],
          responses: {
            '200': {
              description: 'Variant deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            '404': { description: 'Variant not found' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/v1/variants/{id}/images': {
        post: {
          tags: ['Variants'],
          summary: 'Add images to a variant',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Variant ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    images: {
                      type: 'array',
                      items: { type: 'string', format: 'binary' },
                      description: 'Image files'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Images added successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      images: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            url: { type: 'string' },
                            sort_order: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '404': { description: 'Variant not found' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/v1/variants/{id}/sku': {
        put: {
          tags: ['Variants'],
          summary: 'Update variant SKU',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Variant ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['sku'],
                  properties: {
                    sku: { type: 'string', description: 'New SKU' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'SKU updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Bad request - SKU is required' },
            '404': { description: 'Variant not found' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/v1/images/{id}': {
        delete: {
          tags: ['Images'],
          summary: 'Delete an image',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Image ID'
            }
          ],
          responses: {
            '200': {
              description: 'Image deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            '404': { description: 'Image not found' },
            '500': { description: 'Internal server error' }
          }
        }
      }
    },
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  });
});

app.get("/message", (c) => {
  return c.text("Hello Hono!");
});

// Utility function to generate UUID
function generateUUID(): string {
  return uuidv4();
}

// Utility function to get file extension
function getFileExtension(filename: string): string {
  return filename.split('.').pop() || '';
}

// Get all colors endpoint
app.get("/v1/colors", async (c) => {
  try {
    const colorsResult = await c.env.DB.prepare(
      "SELECT * FROM colors ORDER BY created_at DESC"
    ).all();

    return c.json({ colors: colorsResult.results });
  } catch (error) {
    console.error("Error fetching colors:", error);
    return c.json({ error: "Failed to fetch colors" }, 500);
  }
});

// Create color endpoint
app.post("/v1/colors", async (c) => {
  try {
    const body = await c.req.json();
    const { name, display_name, color_category } = body;

    if (!name) {
      return c.json({ error: "Name is required" }, 400);
    }

    const id = generateUUID();
    const result = await c.env.DB.prepare(
      "INSERT INTO colors (id, name, display_name, color_category) VALUES (?, ?, ?, ?)"
    ).bind(id, name, display_name || null, color_category || null).run();

    return c.json({ 
      success: true, 
      color: { id, name, display_name, color_category } 
    });
  } catch (error) {
    console.error("Error creating color:", error);
    return c.json({ error: "Failed to create color" }, 500);
  }
});

app.delete("/v1/colors/:id", async (c) => {
  try {
    const color_id = c.req.param("id");

    // Перевірка, чи існує такий колір
    const color = await c.env.DB.prepare(
      "SELECT id FROM colors WHERE id = ?"
    ).bind(color_id).first();

    if (!color) {
      return c.json({ error: "Color not found" }, 404);
    }

    // Видалення
    await c.env.DB.prepare(
      "DELETE FROM colors WHERE id = ?"
    ).bind(color_id).run();

    return c.json({ success: true, message: "Color deleted successfully" });
  } catch (error) {
    console.error("Error deleting color:", error);
    return c.json({ error: "Failed to delete color" }, 500);
  }
});


// Create product endpoint
app.post("/v1/products", async (c) => {
  try {
    const body = await c.req.json();
    const { name, display_name, description, short_description, type, length, base_price, base_promo_price, category_id } = body;

    if (!name || !category_id) {
      return c.json({ error: "Name and category_id are required" }, 400);
    }

    // Check if product name already exists
    const existingProduct = await c.env.DB.prepare(
      "SELECT id FROM products WHERE name = ?"
    ).bind(name).first();

    if (existingProduct) {
      return c.json({ error: "Product with this name already exists" }, 409);
    }

    const id = generateUUID();
    const result = await c.env.DB.prepare(
      "INSERT INTO products (id, name, display_name, description, short_description, type, length, base_price, base_promo_price, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      id, 
      name, 
      display_name || null, 
      description || null, 
      short_description || null, 
      type || null, 
      length || null, 
      base_price || null, 
      base_promo_price || null, 
      category_id
    ).run();

    return c.json({ 
      success: true, 
      product: { 
        id, 
        name, 
        display_name, 
        description, 
        short_description, 
        type, 
        length, 
        base_price, 
        base_promo_price, 
        category_id: Number(category_id)
      } 
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json({ error: "Failed to create product" }, 500);
  }
});

// Create variant endpoint
app.post("/v1/variants", async (c) => {
  try {
    const formData = await c.req.formData();
    const product_id = formData.get('product_id') as string;
    const sku = formData.get('sku') as string;
    const price = formData.get('price') as string;
    const promo_price = formData.get('promo_price') as string;
    const color = formData.get('color') as string;
    const stock_quantity = formData.get('stock_quantity') as string;
    const images = formData.getAll('images') as File[];

    if (!product_id) {
      return c.json({ error: "product_id is required" }, 400);
    }

    // Check if product exists
    const product = await c.env.DB.prepare(
      "SELECT id FROM products WHERE id = ?"
    ).bind(product_id).first();

    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    const variant_id = generateUUID();
    
    // Create variant
    await c.env.DB.prepare(
      "INSERT INTO variants (id, product_id, sku, price, promo_price, color, stock_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      variant_id,
      product_id,
      sku || null,
      price ? parseFloat(price) : null,
      promo_price ? parseFloat(promo_price) : null,
      color || null,
      stock_quantity ? parseInt(stock_quantity) : 0
    ).run();

    // Handle image uploads
    const uploadedImages = [];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (file && file.size > 0) {
          const fileExtension = getFileExtension(file.name);
          const filename = `${generateUUID()}.${fileExtension}`;
          
          // Upload to R2
          await c.env.R2.put(filename, file.stream());
          
          // Save to database
          const image_id = generateUUID();
          await c.env.DB.prepare(
            "INSERT INTO variant_images (id, variant_id, url, sort_order) VALUES (?, ?, ?, ?)"
          ).bind(image_id, variant_id, filename, i).run();
          
          uploadedImages.push({ id: image_id, url: filename, sort_order: i });
        }
      }
    }

    return c.json({ 
      success: true, 
      variant: { 
        id: variant_id, 
        product_id, 
        sku, 
        price: price ? parseFloat(price) : null, 
        promo_price: promo_price ? parseFloat(promo_price) : null, 
        color, 
        stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
        images: uploadedImages
      } 
    });
  } catch (error) {
    console.error("Error creating variant:", error);
    return c.json({ error: "Failed to create variant" }, 500);
  }
});

// Add variant images endpoint
app.post("/v1/variants/:id/images", async (c) => {
  try {
    const variant_id = c.req.param('id');
    const formData = await c.req.formData();
    const images = formData.getAll('images') as File[];

    // Check if variant exists
    const variant = await c.env.DB.prepare(
      "SELECT id FROM variants WHERE id = ?"
    ).bind(variant_id).first();

    if (!variant) {
      return c.json({ error: "Variant not found" }, 404);
    }

    // Get current max sort order
    const maxSortResult = await c.env.DB.prepare(
      "SELECT MAX(sort_order) as max_order FROM variant_images WHERE variant_id = ?"
    ).bind(variant_id).first();
    
    let currentSortOrder = (maxSortResult?.max_order as number) || -1;

    const uploadedImages = [];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (file && file.size > 0) {
          const fileExtension = getFileExtension(file.name);
          const filename = `${generateUUID()}.${fileExtension}`;
          
          // Upload to R2
          await c.env.R2.put(filename, file.stream());
          
          // Save to database
          const image_id = generateUUID();
          currentSortOrder++;
          await c.env.DB.prepare(
            "INSERT INTO variant_images (id, variant_id, url, sort_order) VALUES (?, ?, ?, ?)"
          ).bind(image_id, variant_id, filename, currentSortOrder).run();
          
          uploadedImages.push({ id: image_id, url: filename, sort_order: currentSortOrder });
        }
      }
    }

    return c.json({ 
      success: true, 
      images: uploadedImages 
    });
  } catch (error) {
    console.error("Error adding variant images:", error);
    return c.json({ error: "Failed to add variant images" }, 500);
  }
});

// Delete product endpoint
app.delete("/v1/products/:id", async (c) => {
  try {
    const product_id = c.req.param('id');

    // Check if product exists
    const product = await c.env.DB.prepare(
      "SELECT id FROM products WHERE id = ?"
    ).bind(product_id).first();

    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    // Get all variant images to delete from R2
    const variantImages = await c.env.DB.prepare(
      "SELECT url FROM variant_images vi JOIN variants v ON vi.variant_id = v.id WHERE v.product_id = ?"
    ).bind(product_id).all();

    // Delete images from R2
    for (const image of variantImages.results as any[]) {
      await c.env.R2.delete(image.url);
    }

    // Delete from database (cascade will handle variant_images)
    await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(product_id).run();

    return c.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ error: "Failed to delete product" }, 500);
  }
});

// Delete variant endpoint
app.delete("/v1/variants/:id", async (c) => {
  try {
    const variant_id = c.req.param('id');

    // Check if variant exists
    const variant = await c.env.DB.prepare(
      "SELECT id FROM variants WHERE id = ?"
    ).bind(variant_id).first();

    if (!variant) {
      return c.json({ error: "Variant not found" }, 404);
    }

    // Get variant images to delete from R2
    const variantImages = await c.env.DB.prepare(
      "SELECT url FROM variant_images WHERE variant_id = ?"
    ).bind(variant_id).all();

    // Delete images from R2
    for (const image of variantImages.results as any[]) {
      await c.env.R2.delete(image.url);
    }

    // Delete from database (cascade will handle variant_images)
    await c.env.DB.prepare("DELETE FROM variants WHERE id = ?").bind(variant_id).run();

    return c.json({ success: true, message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Error deleting variant:", error);
    return c.json({ error: "Failed to delete variant" }, 500);
  }
});

// Update variant SKU endpoint
app.put("/v1/variants/:id/sku", async (c) => {
  try {
    const variant_id = c.req.param('id');
    const body = await c.req.json();
    const { sku } = body;

    if (sku === undefined) {
      return c.json({ error: "SKU is required" }, 400);
    }

    // Check if variant exists
    const variant = await c.env.DB.prepare(
      "SELECT id FROM variants WHERE id = ?"
    ).bind(variant_id).first();

    if (!variant) {
      return c.json({ error: "Variant not found" }, 404);
    }

    // Update SKU
    await c.env.DB.prepare(
      "UPDATE variants SET sku = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(sku, variant_id).run();

    return c.json({ success: true, message: "Variant SKU updated successfully" });
  } catch (error) {
    console.error("Error updating variant SKU:", error);
    return c.json({ error: "Failed to update variant SKU" }, 500);
  }
});

// Delete image endpoint
app.delete("/v1/images/:id", async (c) => {
  try {
    const image_id = c.req.param('id');

    // Get image details
    const image = await c.env.DB.prepare(
      "SELECT url FROM variant_images WHERE id = ?"
    ).bind(image_id).first();

    if (!image) {
      return c.json({ error: "Image not found" }, 404);
    }

    // Delete from R2
    await c.env.R2.delete(image.url as string);

    // Delete from database
    await c.env.DB.prepare("DELETE FROM variant_images WHERE id = ?").bind(image_id).run();

    return c.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return c.json({ error: "Failed to delete image" }, 500);
  }
});

// Get all products endpoint
app.get("/v1/products", async (c) => {

  try {
    // Get all products
    const productsResult = await c.env.DB.prepare(
      "SELECT * FROM products ORDER BY created_at DESC"
    ).all();

    const products: any[] = [];

    await Promise.all(productsResult.results.map(async (product: any) => {
      const variantsResult = await c.env.DB.prepare(
        `SELECT v.*, group_concat(vi.url) as images
        FROM variants v
        JOIN variant_images vi ON v.id = vi.variant_id
        WHERE v.product_id = ?
        GROUP BY v.id
        ORDER BY v.created_at ASC
        `
      ).bind(product.id).all();

      products.push({
        id: product.id,
        name: product.name,
        category: Number(product.category_id),
        type: Number(product.type),
        length: product.length,
        description: product.description,
        variants: variantsResult.results.map((variant: any) => ({
          id: variant.id,
          color: variant.color,
          price: variant.price,
          promo_price: variant.promo_price,
          availability: (variant.stock_quantity || 0) > 0,
          stock_quantity: variant.stock_quantity,
          images: variant?.images?.split?.(',') || []
        }))
      });
    }));
    
    return c.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

// Get all variants endpoint
app.get("/v1/variants", async (c) => {
  try {
    const variantsResult = await c.env.DB.prepare(
      "SELECT * FROM variants ORDER BY created_at DESC"
    ).all();

    const variants = [];
    
    for (const variant of variantsResult.results as any[]) {
      // Get images for each variant
      const imagesResult = await c.env.DB.prepare(
        "SELECT id, url, sort_order FROM variant_images WHERE variant_id = ? ORDER BY sort_order ASC"
      ).bind(variant.id).all();

      const images = imagesResult.results.map((img: any) => ({
        id: img.id,
        url: img.url,
        sort_order: img.sort_order
      }));
      
      // Calculate availability based on stock quantity
      const availability = ((variant.stock_quantity as number) || 0) > 0;
      
      variants.push({
        id: variant.id,
        product_id: variant.product_id,
        sku: variant.sku,
        price: variant.price,
        promo_price: variant.promo_price,
        color: variant.color,
        stock_quantity: variant.stock_quantity,
        availability: availability,
        images: images,
        created_at: variant.created_at,
        updated_at: variant.updated_at
      });
    }

    return c.json({ variants });
  } catch (error) {
    console.error("Error fetching variants:", error);
    return c.json({ error: "Failed to fetch variants" }, 500);
  }
});

// Get single product endpoint
app.get("/v1/products/:id", async (c) => {
  try {
    const product_id = c.req.param('id');

    // Get product
    const product = await c.env.DB.prepare(
      "SELECT * FROM products WHERE id = ?"
    ).bind(product_id).first();

    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    // Get variants for the product
    const variantsResult = await c.env.DB.prepare(
      "SELECT * FROM variants WHERE product_id = ? ORDER BY created_at ASC"
    ).bind(product_id).all();

    const variants = [];
    
    for (const variant of variantsResult.results as any[]) {
      // Get images for each variant
      const imagesResult = await c.env.DB.prepare(
        "SELECT url FROM variant_images WHERE variant_id = ? ORDER BY sort_order ASC"
      ).bind(variant.id).all();

      const images = imagesResult.results.map((img: any) => img.url);
      
      // Calculate availability based on stock quantity
      const availability = (variant.stock_quantity || 0) > 0;
      
      variants.push({
        id: variant.id,
        color: variant.color,
        price: variant.price,
        promo_price: variant.promo_price,
        availability: availability,
        images: images
      });
    }

    const productData = {
      id: product.id,
      name: product.name,
      category: Number(product.category_id),
      type: Number(product.type),
      length: product.length,
      description: product.description,
      short_description: product.short_description,
      display_name: product.display_name,
      base_price: product.base_price,
      base_promo_price: product.base_promo_price,
      variants: variants
    };

    return c.json({ product: productData });
  } catch (error) {
    console.error("Error fetching product:", error);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

// Update product endpoint
app.put("/v1/products/:id", async (c) => {
  try {
    const product_id = c.req.param('id');
    const body = await c.req.json();
    const { name, display_name, description, short_description, type, length, base_price, base_promo_price, category_id } = body;

    // Check if product exists
    const existingProduct = await c.env.DB.prepare(
      "SELECT id FROM products WHERE id = ?"
    ).bind(product_id).first();

    if (!existingProduct) {
      return c.json({ error: "Product not found" }, 404);
    }

    // If name is being updated, check if it conflicts with another product
    if (name) {
      const nameConflict = await c.env.DB.prepare(
        "SELECT id FROM products WHERE name = ? AND id != ?"
      ).bind(name, product_id).first();

      if (nameConflict) {
        return c.json({ error: "Product with this name already exists" }, 409);
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }
    if (display_name !== undefined) {
      updateFields.push("display_name = ?");
      updateValues.push(display_name);
    }
    if (description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(description);
    }
    if (short_description !== undefined) {
      updateFields.push("short_description = ?");
      updateValues.push(short_description);
    }
    if (type !== undefined) {
      updateFields.push("type = ?");
      updateValues.push(type);
    }
    if (length !== undefined) {
      updateFields.push("length = ?");
      updateValues.push(length);
    }
    if (base_price !== undefined) {
      updateFields.push("base_price = ?");
      updateValues.push(base_price);
    }
    if (base_promo_price !== undefined) {
      updateFields.push("base_promo_price = ?");
      updateValues.push(base_promo_price);
    }
    if (category_id !== undefined) {
      updateFields.push("category_id = ?");
      updateValues.push(category_id);
    }

    if (updateFields.length === 0) {
      return c.json({ error: "No fields to update" }, 400);
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(product_id);

    const updateQuery = `UPDATE products SET ${updateFields.join(", ")} WHERE id = ?`;
    
    await c.env.DB.prepare(updateQuery).bind(...updateValues).run();

    // Get updated product
    const updatedProduct = await c.env.DB.prepare(
      "SELECT * FROM products WHERE id = ?"
    ).bind(product_id).first();

    if (!updatedProduct) {
      return c.json({ error: "Failed to retrieve updated product" }, 500);
    }

    return c.json({ 
      success: true, 
      product: { 
        id: updatedProduct.id, 
        name: updatedProduct.name, 
        display_name: updatedProduct.display_name, 
        description: updatedProduct.description, 
        short_description: updatedProduct.short_description, 
        type: Number(updatedProduct.type), 
        length: updatedProduct.length, 
        base_price: updatedProduct.base_price, 
        base_promo_price: updatedProduct.base_promo_price, 
        category_id: Number(updatedProduct.category_id) 
      } 
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ error: "Failed to update product" }, 500);
  }
});

// Get single variant endpoint
app.get("/v1/variants/:id", async (c) => {
  try {
    const variant_id = c.req.param('id');

    // Get variant
    const variant = await c.env.DB.prepare(
      "SELECT * FROM variants WHERE id = ?"
    ).bind(variant_id).first();

    if (!variant) {
      return c.json({ error: "Variant not found" }, 404);
    }

    // Get images for the variant
    const imagesResult = await c.env.DB.prepare(
      "SELECT id, url, sort_order FROM variant_images WHERE variant_id = ? ORDER BY sort_order ASC"
    ).bind(variant_id).all();

    const images = imagesResult.results.map((img: any) => ({
      id: img.id,
      url: img.url,
      sort_order: img.sort_order
    }));
    
    // Calculate availability based on stock quantity
    const availability = ((variant.stock_quantity as number) || 0) > 0;
    
    const variantData = {
      id: variant.id,
      product_id: variant.product_id,
      sku: variant.sku,
      price: variant.price,
      promo_price: variant.promo_price,
      color: variant.color,
      stock_quantity: variant.stock_quantity,
      availability: availability,
      images: images,
      created_at: variant.created_at,
      updated_at: variant.updated_at
    };

    return c.json({ variant: variantData });
  } catch (error) {
    console.error("Error fetching variant:", error);
    return c.json({ error: "Failed to fetch variant" }, 500);
  }
});

// Update variant endpoint
app.put("/v1/variants/:id", async (c) => {
  try {
    const variant_id = c.req.param('id');
    const body = await c.req.json();
    const { sku, price, promo_price, color, stock_quantity } = body;

    // Check if variant exists
    const existingVariant = await c.env.DB.prepare(
      "SELECT id FROM variants WHERE id = ?"
    ).bind(variant_id).first();

    if (!existingVariant) {
      return c.json({ error: "Variant not found" }, 404);
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    if (sku !== undefined) {
      updateFields.push("sku = ?");
      updateValues.push(sku);
    }
    if (price !== undefined) {
      updateFields.push("price = ?");
      updateValues.push(price);
    }
    if (promo_price !== undefined) {
      updateFields.push("promo_price = ?");
      updateValues.push(promo_price);
    }
    if (color !== undefined) {
      updateFields.push("color = ?");
      updateValues.push(color);
    }
    if (stock_quantity !== undefined) {
      updateFields.push("stock_quantity = ?");
      updateValues.push(stock_quantity);
    }

    if (updateFields.length === 0) {
      return c.json({ error: "No fields to update" }, 400);
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(variant_id);

    const updateQuery = `UPDATE variants SET ${updateFields.join(", ")} WHERE id = ?`;
    
    await c.env.DB.prepare(updateQuery).bind(...updateValues).run();

    // Get updated variant
    const updatedVariant = await c.env.DB.prepare(
      "SELECT * FROM variants WHERE id = ?"
    ).bind(variant_id).first();

    if (!updatedVariant) {
      return c.json({ error: "Failed to retrieve updated variant" }, 500);
    }

    return c.json({ 
      success: true, 
      variant: { 
        id: updatedVariant.id, 
        product_id: updatedVariant.product_id, 
        sku: updatedVariant.sku, 
        price: updatedVariant.price, 
        promo_price: updatedVariant.promo_price, 
        color: updatedVariant.color, 
        stock_quantity: updatedVariant.stock_quantity 
      } 
    });
  } catch (error) {
    console.error("Error updating variant:", error);
    return c.json({ error: "Failed to update variant" }, 500);
  }
});

export default app;
