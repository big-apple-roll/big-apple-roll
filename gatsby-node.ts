import path from "node:path";

import { GatsbyNode, Node } from "gatsby";
import { createFilePath } from "gatsby-source-filesystem";
import FilterWarningsPlugin from "webpack-filter-warnings-plugin";

import { ScheduleDayTemplateContext } from "src/templates/scheduleDayTemplate";
import { ScheduleEventTemplateContext } from "src/templates/scheduleEventTemplate";
import { ShopProductTemplateContext } from "src/templates/shopProductTemplate";

const SUPPORTED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

interface FileNode extends Node {
  extension: string; // no leading dot
  name: string;
  relativeDirectory: string;
  relativePath: string;
}

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type MarkdownRemark implements Node {
      linkedFiles: [File!]!
      linkedImages: [File!]!
      name: String!
      relativeDirectory: String!
      relativePath: String!
      slug: String!
    }
  `);
};

interface ResolverContext {
  // https://www.gatsbyjs.com/docs/reference/graphql-data-layer/node-model/
  nodeModel: {
    findAll: <N extends Node>(options?: {
      type?: string;
      query?: {
        filter?: object;
        sort?: object;
        limit?: number;
        skip?: number;
      };
    }) => Promise<{
      entries: Iterable<N>;
    }>;
    findOne: <N extends Node>(options?: {
      type: string;
      query: {
        filter?: object;
        sort?: object;
        limit?: number;
        skip?: number;
      };
    }) => Promise<N>;
    getNodeById: <N extends Node>(options: { id: string; type?: string }) => N;
    getFieldValue: (node: Node, fieldPath: string) => Promise<unknown>;
  };
}

export const createResolvers: GatsbyNode["createResolvers"] = ({ createResolvers }) => {
  const getParentFileNode = (source: Node, context: ResolverContext): FileNode | null => {
    return source.parent
      ? context.nodeModel.getNodeById<FileNode>({
          id: source.parent,
          type: "File",
        })
      : null;
  };

  const getLinkedFileNodes = async (
    source: Node,
    context: ResolverContext,
    options: {
      includeImages: boolean;
    },
  ): Promise<Array<FileNode>> => {
    const parentFileNode = getParentFileNode(source, context);
    if (!parentFileNode) {
      return [];
    }

    const allFileNodes = (
      await context.nodeModel.findAll<FileNode>({
        type: `File`,
        query: {
          filter: { relativeDirectory: { eq: parentFileNode.relativeDirectory } },
        },
      })
    ).entries;

    const linkedFileNodes = Array.from(allFileNodes).filter((fileNode) => {
      if (fileNode.id === parentFileNode.id) {
        return false;
      }

      if (!fileNode.name.startsWith(parentFileNode.name)) {
        return false;
      }

      if (options.includeImages) {
        return SUPPORTED_IMAGE_EXTENSIONS.has(fileNode.extension);
      } else {
        return !SUPPORTED_IMAGE_EXTENSIONS.has(fileNode.extension);
      }
    });

    return linkedFileNodes;
  };

  createResolvers({
    MarkdownRemark: {
      linkedFiles: {
        type: "[File!]!",
        resolve: async (source: Node, args: object, context: ResolverContext) => {
          return await getLinkedFileNodes(source, context, { includeImages: false });
        },
      },
      linkedImages: {
        type: "[File!]!",
        resolve: async (source: Node, args: object, context: ResolverContext) => {
          return await getLinkedFileNodes(source, context, { includeImages: true });
        },
      },
      name: {
        type: "String!",
        resolve: (source: Node, args: object, context: ResolverContext) => {
          return getParentFileNode(source, context)?.name ?? "";
        },
      },
      relativeDirectory: {
        type: "String!",
        resolve: (source: Node, args: object, context: ResolverContext) => {
          return getParentFileNode(source, context)?.relativeDirectory ?? "";
        },
      },
      relativePath: {
        type: "String!",
        resolve: (source: Node, args: object, context: ResolverContext) => {
          return getParentFileNode(source, context)?.relativePath ?? "";
        },
      },
      slug: {
        type: "String!",
        resolve: (source: Node, args: object, context: ResolverContext) => {
          return createFilePath({
            node: source,
            getNode: (id: string) => {
              return context.nodeModel.getNodeById({ id, type: "File" });
            },
          });
        },
      },
    },
  });
};

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [
      new FilterWarningsPlugin({
        exclude: /mini-css-extract-plugin[^]*Conflicting order. Following module has been added:/,
      }),
    ],
  });
};

export const createPages: GatsbyNode["createPages"] = async (args) => {
  const { actions, graphql, reporter } = args;
  const { createPage } = actions;

  const result = await graphql<Queries.CreatePagesQuery>(`
    query CreatePages {
      scheduleDays: allMarkdownRemark(
        filter: { relativeDirectory: { eq: "schedule" } }
        sort: { frontmatter: { date: ASC } }
      ) {
        edges {
          node {
            id
            slug
          }
          previous {
            id
          }
          next {
            id
          }
        }
      }
      scheduleEvents: allMarkdownRemark(
        filter: { relativeDirectory: { regex: "/^schedule/.*/" } }
        sort: { frontmatter: { date: ASC } }
      ) {
        edges {
          node {
            id
            slug
          }
          previous {
            id
          }
          next {
            id
          }
        }
      }
      shopProducts: allMarkdownRemark(filter: { relativeDirectory: { eq: "shop" } }) {
        edges {
          node {
            id
            slug
          }
        }
      }
    }
  `);

  if (result.errors || !result.data) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }

  // Schedule day templates
  result.data.scheduleDays.edges.forEach(({ node, previous, next }) => {
    if (!node.slug) {
      return;
    }
    const context: ScheduleDayTemplateContext = {
      scheduleDayId: node.id,
      previousScheduleDayId: previous?.id,
      nextScheduleDayId: next?.id,
      scheduleEventsSlugRegex: `/^${node.slug}.+/`,
    };
    createPage({
      component: path.resolve(`./src/templates/scheduleDayTemplate.tsx`),
      path: node.slug,
      context,
    });
  });

  // Schedule event templates
  result.data.scheduleEvents.edges.forEach(({ node, previous, next }) => {
    if (!node.slug) {
      return;
    }
    const context: ScheduleEventTemplateContext = {
      scheduleEventId: node.id,
      previousScheduleEventId: previous?.id,
      nextScheduleEventId: next?.id,
    };
    createPage({
      component: path.resolve(`./src/templates/scheduleEventTemplate.tsx`),
      path: node.slug,
      context,
    });
  });

  // Shop product templates
  result.data.shopProducts.edges.forEach(({ node }) => {
    if (!node.slug) {
      return;
    }
    const context: ShopProductTemplateContext = {
      shopProductId: node.id,
    };
    createPage({
      component: path.resolve(`./src/templates/shopProductTemplate.tsx`),
      path: node.slug,
      context,
    });
  });
};
