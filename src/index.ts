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
  // return c.json({"products":[{"id":"f6d24824-9f17-4e25-9a74-77ba0439177f","name":"MHMD 1863","category":1,"type":2,"length":40,"description":null,"variants":[{"id":"7850450b-cdf1-48f1-b5d0-bdfda1b53e6e","color":"4TT/33A","price":2200,"promo_price":2200,"availability":true,"images":["3e323026-d37d-4c36-8ad0-b2e4f3e1d6a2.HEIC","ad0678f4-16f6-466d-970f-8890800ff0ec.HEIC","1b47ce3d-398f-4a75-81aa-93fa25bf88c9.HEIC","2fd8de8c-92ce-46bb-b70b-9f197928d696.HEIC"]},{"id":"8572c19c-a80c-43ff-804b-b2107653dce5","color":"24B","price":2200,"promo_price":2200,"availability":true,"images":["c19248be-4e5c-43ca-9942-a365f410207e.HEIC","e31f0a24-36ae-4621-8655-ae3d550bab7b.HEIC","ff5da204-3c57-405a-9339-1c862488aa05.HEIC","02e71ee7-bf08-4714-b44a-a61e97bc3611.HEIC"]},{"id":"0082ee2b-dc56-43b3-bcf6-ed9a89c991e8","color":"RH12","price":2200,"promo_price":2200,"availability":true,"images":["10865bbf-c31d-4dba-9ac1-b517d232129b.HEIC","ba60e4f4-9583-406e-af5a-1dabd52953b6.HEIC","406fc4ea-9821-40e6-b40c-c8840133b289.HEIC"]}]},{"id":"3c9c488f-43f0-4b66-b0f3-418e3fbdc938","name":"5161 A","category":1,"type":2,"length":40,"description":null,"variants":[{"id":"f1f435db-b139-4eb5-bd5b-58093bd13861","color":"1","price":2000,"promo_price":2000,"availability":true,"images":["23cca076-cb65-4caf-a248-6e98adc280b5.HEIC","ab04c360-31a7-4e3c-ac2a-3b9b8dd5f079.HEIC","79f065ac-888a-488d-886f-0dcd028f452a.HEIC","461a040c-e3c0-498c-9d98-0c9a0418cc99.HEIC"]},{"id":"8a2c3cdc-7770-4867-96af-fc1bdcc9e6da","color":"6","price":2000,"promo_price":2000,"availability":true,"images":["2ee17a87-b8c1-4f5a-bb24-7a3a439cf905.HEIC","2009dcd4-21e0-4700-9516-d626da831f5c.HEIC","7ff39293-b599-4989-b8fd-8cae572d2f54.HEIC"]},{"id":"c21c1f6a-4a82-4946-b7af-d654de2675f3","color":"15H/613","price":2000,"promo_price":2000,"availability":true,"images":["f6438a71-735b-4965-97a0-8eb412a48fca.HEIC","821417d4-1833-4905-a182-e711ca4ac0f5.HEIC","54627902-7c17-4747-9fdd-01fcf9d346fb.HEIC","f5856774-4f9c-43a1-a91e-f6434a4b9a52.HEIC"]},{"id":"17bcb603-6847-40f7-8d36-49b911a5eaae","color":"33","price":2000,"promo_price":2000,"availability":true,"images":["163b25a2-8f88-4e5c-8103-57630b3e7d2e.HEIC","d06fcd93-5977-41e5-aad4-b0908e06f292.HEIC","3c43a57b-6b56-46d6-b613-226f01dd72f6.HEIC"]},{"id":"26b32453-da3a-45d2-9be3-52431526d92a","color":"122","price":2000,"promo_price":2000,"availability":true,"images":["8fea3ac7-5570-4806-9784-3eb32eb3f5d9.HEIC","20e39d65-8ce4-4e28-adde-ac02b5214ff7.HEIC","03d08c3b-81ae-41b4-8e9e-b1d4c1df236c.HEIC","b7a7a08b-fee8-4ec2-be1c-1882fea2a6b1.HEIC","e7e778cc-bf03-499e-90a5-312f4af44578.HEIC"]},{"id":"d626bc1b-fa4e-4fb3-952d-b8b430247070","color":"130 A","price":2000,"promo_price":2000,"availability":true,"images":["8cb91ec6-46db-4939-9e0b-6cfe1fe68544.HEIC","62cefc2d-81cd-4597-aa19-157481886a08.HEIC","072324fb-8889-4f48-bc82-6b9e9ba3e097.HEIC","1bee7bf3-093e-4932-986b-e034e53b47d0.HEIC"]},{"id":"26562a37-9559-4e36-bc41-9af75e06c0d7","color":"8","price":2000,"promo_price":2000,"availability":true,"images":["a7f207b7-0975-4916-8f22-19b8079368ef.HEIC","e6f1ec35-a633-4893-9e2f-85c0dbc36b22.HEIC","6ecf8218-8c6b-43bb-8c26-7cbb70ba4bc5.HEIC","8cdbd1b0-62d1-4a59-9006-4179d3b8fb77.HEIC"]},{"id":"7fb0ce56-67b5-4993-b7ac-f1cfc95c65d7","color":"24H613","price":2000,"promo_price":2000,"availability":true,"images":["ca34d08c-b6f0-47b3-9d08-722e71fed021.HEIC","7d1b83ae-1f3d-42cd-9f4b-b63364c1792f.HEIC","e34ba1fd-eb94-42a4-b88b-99682bfd20ba.HEIC","c6f8a8e0-9b1d-47ad-9efb-9fc8fe849b8a.HEIC"]}]},{"id":"9301b711-9928-48b4-a505-2ffb57a4d79b","name":"5222 AT","category":1,"type":2,"length":50,"description":"Образ: яскравий, енергійний, артистичний\n Пасує до: карих, зелених очей, теплих тонів шкір","variants":[{"id":"00176a05-aa84-47d8-b59a-c55fb94002e4","color":"6","price":2300,"promo_price":2300,"availability":true,"images":["c1df379c-1f28-47da-b5bf-d64706396b73.HEIC","4b5215d5-36e7-4189-875f-05c7fb4ef36c.HEIC","57dd953d-cb52-486c-bb92-cfee595f959d.HEIC","e0d839f2-41e1-4c24-b186-3ec9febd025a.HEIC"]},{"id":"0d4c30a7-018f-4222-ac3f-4fffd10fa278","color":"130","price":2300,"promo_price":2300,"availability":true,"images":["6d2505d9-78dc-4083-8420-8f069dbc9cd4.HEIC","131c6097-b476-4091-98f2-42069b093b8e.HEIC","29a35461-65a1-4324-bbe3-4e1a0f6b4625.HEIC","1c41488e-b779-4898-8159-e38538ba311a.HEIC"]}]},{"id":"e09d3e06-1a45-40ea-95c6-d87706cbfbfd","name":"7002 AT(5222 AT,MOKKO)","category":1,"type":2,"length":50,"description":null,"variants":[{"id":"970ab76d-ca65-475b-abb8-aab91cebacc3","color":"1","price":2300,"promo_price":2300,"availability":true,"images":["89fa4091-714c-49fa-b1f5-d7451469ee41.HEIC","b750e8bf-b507-47ed-b862-c52f50e36af4.HEIC","37706541-22fe-4dab-90bc-9fe4e961318f.HEIC","dab8b229-44bb-4674-a342-f936938849a9.HEIC","e6a0704b-3172-45fa-a03f-1da477341d85.HEIC","bac5c15e-c038-440c-83d8-2bde2f7510a4.HEIC"]},{"id":"d1fffe78-ec84-4eae-8d62-21747ae19237","color":"6","price":2300,"promo_price":2300,"availability":true,"images":["c5dbe493-c826-42c0-8533-255e995568f7.HEIC","7640c0c5-da7c-4091-b5da-697f651d4a0a.HEIC","b9addb68-4c3e-45ed-917b-2cb4ee6dfc97.HEIC","a31d48e6-e6e5-42d8-810d-3b8d9ca8974a.HEIC","05f817f2-1b56-49f9-921c-49944d8b50ab.HEIC"]},{"id":"4ab263db-8054-4967-9b30-9ed7f87ec81a","color":"4","price":2300,"promo_price":2300,"availability":true,"images":["550a2907-e30f-48ec-9f1a-e66181709693.HEIC","8021ff1c-3051-4cd6-9c35-94afb2ff0cee.HEIC","338f7df8-9a86-4eae-b5ff-78e4715b4385.HEIC","947baa39-f3ed-4fd2-a1eb-df8de024a642.HEIC"]},{"id":"cdb1fbba-093d-4179-ac19-433dc258b2c4","color":"1","price":2300,"promo_price":2300,"availability":true,"images":["3387d6fb-be52-426f-96f5-ca5cd3eb9f9c.HEIC","4f8b6d8e-ea2d-4c7b-b914-92b6ffc3dee0.HEIC","95b9d762-249d-4b88-a9ba-e9f25f38a688.HEIC","6785cbfb-a06f-4333-bcb2-68e322f862c4.HEIC"]},{"id":"ea836dc5-96e6-4ba3-bef9-e21caa25f0e9","color":"24BT/613","price":2300,"promo_price":2300,"availability":true,"images":["a1e1a677-9bab-40ab-bc66-7857d871d3db.HEIC","38dbb059-0988-480e-a9c4-94cd4f876903.HEIC","78825e3c-c296-4d78-a073-a1993be93a73.HEIC"]},{"id":"80682e93-a838-46ae-a6aa-69189101fe2d","color":"12/26","price":2300,"promo_price":2300,"availability":true,"images":["9505cd1f-61e8-44de-87ea-29ecd53feba6.HEIC","2ff0fc8a-3777-4b8f-b893-5f48f4094558.HEIC","a946881c-cbed-4af3-a923-6e8288bed871.HEIC","e06792c2-1cb7-4ef1-8496-110b20c8d18b.HEIC"]},{"id":"125ac023-996b-4807-b9c7-908d92827d47","color":"8","price":2300,"promo_price":2300,"availability":true,"images":["064afece-69cb-4b49-975b-da620e29d68d.HEIC","e37cdee7-4503-493f-a449-fbead4f84d33.HEIC","ba72aaa7-451a-415e-b92a-aeb5ee5877c9.HEIC"]},{"id":"6b07a3f0-6980-46a5-b28b-fa45e49621f3","color":"130","price":2300,"promo_price":2300,"availability":true,"images":["f096a575-d6e8-49e9-8c5c-4ddf2cc97737.HEIC","68232c98-4620-4a9e-8af0-b9184f399097.HEIC","f5afb926-9005-4b3d-af6c-e748b03e679b.HEIC","900b1493-75ad-46cc-b762-a4c7017fe1d5.HEIC"]}]},{"id":"2a7376ea-9ea1-4e03-bd73-6fe145056751","name":"5048 AT","category":1,"type":2,"length":50,"description":null,"variants":[{"id":"fdc5c5a7-2d3d-473b-b2ef-71f7463d6aa8","color":"1","price":2300,"promo_price":2300,"availability":true,"images":["edf8da4f-7089-467a-b804-64c75006d758.HEIC","08d25d33-c713-42a6-84bc-6e2042ddd929.HEIC","413b5c29-052a-48f2-b97f-e7d2e3e56510.HEIC"]},{"id":"fed56bc7-abc9-41e3-b37a-b1739a164a67","color":"8","price":2300,"promo_price":2300,"availability":true,"images":["e99fa94e-4171-4131-80d9-750648958f8a.HEIC","7bb7067f-1fa1-44e6-87d5-b2b1137d33a6.HEIC","d71da877-8ae2-4823-b015-f54cb7e2204f.HEIC","7c3bd6e1-1594-4c9b-9fd6-cc98380466a8.HEIC"]}]},{"id":"dc754f8d-b71c-4134-bc0b-3c963f30728a","name":"0782T","category":1,"type":2,"length":50,"description":null,"variants":[{"id":"16d9e9c8-f665-4d49-9e03-24f573b16b2e","color":"H16/613","price":1500,"promo_price":1500,"availability":true,"images":["068d5dd7-19d7-4c55-acec-f7632845aaac.HEIC","64184987-9cdc-48f7-bc25-72df73e07057.HEIC","c705c18f-9c6d-4e11-ac45-9832f169c806.HEIC","7c8f45ac-280d-4ecd-a341-80c113ec824c.HEIC"]},{"id":"952bd307-4fd1-4d65-bae7-354088232474","color":"6","price":1500,"promo_price":1500,"availability":true,"images":["5b3adc31-eaa4-4e91-b34d-087d42be8b17.HEIC","52751fdb-1c09-4774-b153-3dc10bdb575c.HEIC","b8d9aefd-bee3-47b3-831a-e584afef02e9.HEIC","7da28c77-c749-4b3c-8a5a-783874ab1a57.HEIC"]},{"id":"a65330f8-d4f0-43d4-8fe6-890384bc46c3","color":"8","price":1500,"promo_price":1500,"availability":true,"images":["29feb32b-a84f-462f-8653-56b8e0471ed8.HEIC","ad3c6770-8ac5-42cd-b543-cbeba36ae2e4.HEIC","517e7198-3c6f-47da-b450-1eaae2f9eadc.HEIC","6be1f7ef-69c4-4303-9771-9e10d142850e.HEIC","822fb06e-a793-429b-8057-37f25ef550a2.HEIC"]}]},{"id":"2d21acf2-8899-466a-93c3-df702628cb14","name":"KRISS AT +20","category":1,"type":2,"length":80,"description":null,"variants":[{"id":"e78ff777-664b-4771-8449-223543855967","color":"984YS1B","price":3000,"promo_price":3000,"availability":true,"images":["44caccf5-bacc-420c-96ae-4b490754aaea.HEIC","c9f8fa73-3e06-438c-8aaa-44d0c5c44277.HEIC","33b17ff2-b39f-479b-af2a-df590bed7c72.HEIC","4bb77e9d-ddcb-4c5c-88b5-22a9d96199e5.HEIC","042eda35-79d3-4b9c-be3e-1faac1085509.HEIC"]},{"id":"6a944810-0949-40c2-b05c-f5e95643110d","color":"6","price":3000,"promo_price":3000,"availability":true,"images":["e9cc1dc7-b950-45cb-b342-38e9501a4f02.HEIC","7c0f18ef-e12f-4a3f-83ac-1c0790e21565.HEIC","6525b43b-72e1-4c4b-bcef-4a24e2745df7.HEIC","f2c56505-ed04-4c90-ac2f-ffc8f5e32eaf.HEIC"]},{"id":"d17bf343-c5dd-4ab7-a2f3-d2a5d1948125","color":"H16/613","price":3000,"promo_price":3000,"availability":true,"images":["39eb1680-1cec-4ec2-9cf9-989a5731fdf6.HEIC","ebb65d34-3285-4141-8d52-58749f6be5ff.HEIC","813c5728-2799-462c-af04-2aed87db1610.HEIC"]}]},{"id":"fbc00413-f740-4b39-9a41-6c19f01a5686","name":"test2","category":2,"type":1,"length":44,"description":"test2","variants":[{"id":"d0ed24d2-3232-4484-9b8f-6559df96d409","color":"33","price":111,"promo_price":11,"availability":true,"images":["8e2d435d-c358-4b44-bdef-8dc6184aa09e.HEIC"]}]},{"id":"afa2be1c-664c-410a-a7ba-2386e2d60f5b","name":"SW543","category":1,"type":2,"length":20,"description":"Каре (пряме волосся)","variants":[{"id":"f94e2945-aeeb-4997-b582-f79e17940dcc","color":"TT1B/900","price":1800,"promo_price":null,"availability":true,"images":["c11ffa61-d56e-4241-bb38-de2f99fe0fdd.HEIC","cee11dc1-2b10-454a-89af-3536ed92a7ea.HEIC","18509e45-7e22-4bc3-89b9-19768ad14e55.HEIC","9e1e622e-c335-484b-ba74-45fb7d3c46d7.HEIC"]},{"id":"c49550bc-df25-4867-99ab-6c9d346bfd49","color":"14","price":1800,"promo_price":null,"availability":true,"images":["76933e99-5aec-48f1-a8dc-6c9296dea457.HEIC","a632f688-9e20-4038-99c9-895ad4fd1399.HEIC","2fab37a1-70b2-4472-9da2-22063bb031b3.HEIC","a514a778-de3a-4bb5-8d4e-f6e8b4c4c97d.HEIC"]},{"id":"513cd650-9cc2-464e-9956-e1dc3dbd29c1","color":"4","price":1800,"promo_price":null,"availability":true,"images":["b4e7dfbd-665d-47c2-b6b7-848f45441c17.HEIC","c0681c3b-d6f1-47a8-9961-c534086e0dbb.HEIC","bead9995-6609-4666-a7bf-daecd3db0553.HEIC"]},{"id":"ff18b5ff-37e4-4886-a319-189da0df71e9","color":"24H613","price":1800,"promo_price":null,"availability":true,"images":["d8331b47-4fbc-4b35-98c2-c420abc06a0d.HEIC","1fa1f2be-82a7-4fee-8c6d-440596ade4c1.HEIC","1593e7f7-3834-4360-b5c2-2a2f4b98bf45.HEIC","4ef88d59-907a-4e13-9f82-b0b0f0582094.HEIC"]},{"id":"4609dfa1-531e-4471-b854-bb9c6c99e37d","color":"H16/613","price":1800,"promo_price":null,"availability":true,"images":["66c590ce-c6a5-4444-858d-c56fcdbadb14.HEIC","a15728b9-7505-44cc-8a7c-4dad4b232efd.HEIC","13d8f1a3-901f-4791-8b6e-4dd1327bb6e9.HEIC"]},{"id":"fef8b5b4-40d2-4f30-8ea9-2e731ee42a68","color":"613","price":1800,"promo_price":null,"availability":true,"images":["3c6dbc00-e10f-4776-9cbd-c77e13809b43.HEIC","5e384d28-e05e-46ba-a03e-da524d7ef198.HEIC","a0b10568-c57c-4967-ba43-5a47a32cb02f.HEIC","9067c3f8-ce54-430f-a84b-0b47d9ed7adb.HEIC"]},{"id":"4b1f0902-9c5e-49bc-9081-b8cdc7ca3eee","color":"984YS1B","price":1800,"promo_price":null,"availability":true,"images":["86cf378f-5494-4840-9d89-dd7217c7f58c.HEIC","bed4c463-2d85-4bd1-b166-7c6aeda65b7e.HEIC","d5b367b1-8585-43e7-bb68-876f79e8bf4c.HEIC"]},{"id":"b03db6aa-98f5-4e07-ab83-9a2b68598c0a","color":"33","price":1800,"promo_price":null,"availability":true,"images":["0574d0fd-8334-4041-8289-c50874447058.HEIC","6bc38a6a-c606-4d7a-aa36-2ba10235f93b.HEIC","d75b6004-d17f-48d3-b374-5a838eca419d.HEIC","60f7423c-1145-4ffa-ae99-44eb98c5bc2f.HEIC","d9c72716-223f-4f7f-b228-ce11a39ab7e6.HEIC"]},{"id":"5489fb37-f9d3-4fdb-a386-c87167994533","color":"12","price":1800,"promo_price":null,"availability":true,"images":["13045350-5787-4428-b9c2-bf7abe9e3502.HEIC","d9d6f8be-87da-4a4d-848b-0ff46d726fee.HEIC","39f4c7d3-8ce2-46a8-84cc-bbacf77abbaa.HEIC","b711c484-fe28-4d20-bf6f-c44bb73466f5.HEIC","8278bf40-381d-4d92-a8ca-17f5aeba5cef.HEIC","61b55784-6c12-401c-8bc1-67c0daa88f48.HEIC"]},{"id":"2c456a16-114a-42c5-a673-66bcd104ec22","color":"33A","price":1800,"promo_price":null,"availability":true,"images":["0986c35c-d792-4efb-8910-f53c3b8d693c.HEIC","56765579-21ab-4412-9bf5-6689f6557757.HEIC","8e395f4b-603b-4471-a9c8-48fc4434da6f.HEIC","59339656-8ab6-42ec-a56a-2a37979265c2.HEIC","ffb5ab69-25c7-45a1-a1b2-14d007297db4.HEIC"]},{"id":"5c60f931-9909-4f98-b67b-2b229ca02ce0","color":"8","price":1800,"promo_price":null,"availability":true,"images":["4f22506a-8a20-4120-9bff-3c4e53181399.HEIC","fee9d826-4f58-46a8-9191-c8b960e04283.HEIC","ecaebbf1-3acf-4813-b2c0-8d535d89aaf8.HEIC","d794e230-3590-4898-a992-7aacb25eb8e0.HEIC"]},{"id":"602ac967-a18d-4eaf-87fc-ea540eeef495","color":"16H613","price":1800,"promo_price":null,"availability":true,"images":["7bdc4951-7c03-4171-8ea5-3d94cae107d5.HEIC","9b1b3bb4-ff92-413c-b1c7-8477ff18852a.HEIC","c0980395-d312-41fc-ae0d-4a8ab8619443.HEIC","15dd7513-d2d8-4a98-992b-0e9f35e9980b.HEIC"]},{"id":"5cc9da71-9f12-4048-8f33-d4f415e97d59","color":"1","price":1800,"promo_price":null,"availability":true,"images":["cd3ab027-f27f-4647-a203-4f540053dd72.HEIC","6fc6deb3-9001-4c7b-a478-fda786221e46.HEIC","4dd7dc9b-7f48-4943-a4cf-56d227d85375.HEIC","a2a756e8-fd9b-4990-8869-d285cf48df28.HEIC","367ab7d4-02b0-4a74-9ced-0310f6a2c6e9.HEIC"]},{"id":"8445afb7-a761-4063-b3d1-064f25faec4d","color":"6","price":1800,"promo_price":null,"availability":true,"images":["023bd9d7-5152-4c6b-81d1-268e222c544f.HEIC","2d4e8321-4049-49cc-889e-78a1c1491119.HEIC","cf4e3bbc-c415-4ca5-909c-af09522b5241.HEIC","0aa1ec83-b726-43e9-ada3-2b8dd090d67f.HEIC","a34b1e4a-459a-46e6-897e-94d8c0086d4f.HEIC"]},{"id":"c80f02d7-67e9-42c2-977a-107a556b3a76","color":"10","price":1800,"promo_price":null,"availability":true,"images":["a74c3d58-86ad-4028-ad4f-c739506e3aa4.HEIC","b69706df-c2b2-4fee-b8e4-fa0a77603407.HEIC","409e758f-e634-4ef1-b6e0-320688836e29.HEIC","11857f3b-3ce3-4c47-b1cb-74c44f0e46f8.HEIC","d07c1235-9641-4f65-9280-91768af948fc.HEIC","87b7f9ea-12f5-4af8-baa7-64cb099bf13e.HEIC"]},{"id":"70486ff6-e589-47ec-b839-593e8f02b8a1","color":"613YS4","price":1800,"promo_price":null,"availability":true,"images":["3b226e5d-f35f-4820-be7e-96822bfda2d9.HEIC","0e2a1fbd-c4f1-4abd-93e9-4025100680a2.HEIC","c0579e03-a0f5-41fb-b10d-08043e748ab9.HEIC","d32e3a9c-bd7e-4dc0-a2a8-b270a2f8fd16.HEIC","558067d5-8bb2-4983-bc50-b6000c4b536b.HEIC"]},{"id":"1f144575-d79b-4f02-b649-2e47e27ef71e","color":"26","price":1800,"promo_price":null,"availability":true,"images":["2697d785-4f4c-4b2f-b4ec-26888e6ed942.HEIC","0410df8d-8cbe-40d1-adc1-2c18d57e2944.HEIC","674fedfc-5e95-4f99-9c10-67af20450c2f.HEIC","c2256b98-35ba-4129-842c-0f527d6f449a.HEIC","9ba9e101-e662-42d1-9e80-45d797ad1011.HEIC","27a755c2-fef1-48be-9aca-b8e507ee25c3.HEIC","54c6b4a1-9f7c-4fca-a61f-b7918e14f44e.HEIC"]},{"id":"0ec3c0ff-75e3-41a5-8127-d4e11fdeafe8","color":"15","price":1800,"promo_price":null,"availability":true,"images":["19f634f8-a8b8-4d07-ad41-9716cbb40761.HEIC","ea3d6a70-3f01-4d3c-934f-24cdf3a69b9d.HEIC","119e5c10-4912-46fd-911d-4859354c297c.HEIC","0d7c4b71-a373-4454-a0c0-db100e4f8930.HEIC","f5157579-0fc3-463b-ac36-6a5e9d14adb7.HEIC"]},{"id":"68167a6c-3994-43ec-bb08-8d891055c03d","color":"24SP613YS4","price":1800,"promo_price":null,"availability":true,"images":["878ed428-2478-4d13-8e81-e844d92715fc.HEIC","b804e42a-5d4f-4ec8-90f8-cc6c8c76db70.HEIC","e2ebb6b6-b030-4af5-96b7-83492908e972.HEIC","ddad3ad3-eff3-4f22-856f-739415ac8c08.HEIC","53a0bc8d-4638-4910-8f18-2d366b66d364.HEIC"]}]},{"id":"2ccc8890-d35d-49dd-b56b-ca44a9d03b0f","name":"Test 1","category":1,"type":1,"length":40,"description":"some test description","variants":[{"id":"e9deeecb-1b57-498f-b97c-facfecfa2082","color":"1","price":1000,"promo_price":999,"availability":true,"images":["1cee988c-235e-438e-b50f-3134f1dda65e.HEIC","5ff457bb-c69a-4aa4-86dd-7415c8c966cb.HEIC","a2f0225a-f86b-44a8-959b-d01ae166c193.HEIC"]}]}]});
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
    
    // for (const product of productsResult.results as any[]) {
    //   // Get variants for each product
    //   const variantsResult = await c.env.DB.prepare(
    //     "SELECT * FROM variants WHERE product_id = ? ORDER BY created_at ASC"
    //   ).bind(product.id).all();

    //   const variants = [];
      
    //   for (const variant of variantsResult.results as any[]) {
    //     // Get images for each variant
    //     const imagesResult = await c.env.DB.prepare(
    //       "SELECT url FROM variant_images WHERE variant_id = ? ORDER BY sort_order ASC"
    //     ).bind(variant.id).all();

    //     const images = imagesResult.results.map((img: any) => img.url);
        
    //     // Calculate availability based on stock quantity
    //     const availability = (variant.stock_quantity || 0) > 0;
        
    //     variants.push({
    //       id: variant.id,
    //       color: variant.color,
    //       price: variant.price,
    //       promo_price: variant.promo_price,
    //       availability: availability,
    //       images: images
    //     });
    //   }

    //   products.push({
    //     id: product.id,
    //     name: product.name,
    //     category: Number(product.category_id),
    //     type: Number(product.type),
    //     length: product.length,
    //     description: product.description,
    //     variants: variants
    //   });
    // }

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
